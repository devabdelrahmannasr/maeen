import { DOMAIN_STORES, READING_HELPER_DATABASE_NAME, READING_HELPER_DATABASE_VERSION, openReadingHelperDatabase } from './database';
import { assertRuntimeWritable } from './runtimeMigration';
import { exportDomainData, type ProductExportEnvelope } from './dataExport';
import { beginImportJournal, clearImportJournal, markImportCommitting, markImportRollbackRequired } from './importJournal';

export type ImportIssueSeverity = 'error' | 'warning';

export interface ImportIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: ImportIssueSeverity;
  readonly store?: string;
  readonly recordId?: string;
}

export interface ImportPreview {
  readonly ok: boolean;
  readonly envelope: ProductExportEnvelope | null;
  readonly counts: Readonly<Record<string, number>>;
  readonly issues: readonly ImportIssue[];
  readonly migrationSteps: readonly string[];
}

const FORBIDDEN_KEYS = /pdf(?:bytes|text|content)?|response|headers|fetchedurl|remoteidentifier|telemetry|analytics/i;
const MAX_IMPORT_TEXT_LENGTH = 10_000_000;
const MAX_TEXT_FIELD_LENGTH = 200_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasForbiddenField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((entry) => hasForbiddenField(entry));
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, nested]) => FORBIDDEN_KEYS.test(key) || hasForbiddenField(nested));
}

function validateRecordFields(value: unknown, path: string, issues: ImportIssue[]): void {
  if (typeof value === 'string') {
    if (value.length > MAX_TEXT_FIELD_LENGTH) issues.push(issue('text-too-large', 'النص يتجاوز الحد المحلي المسموح.', 'error', path));
    return;
  }
  if (Array.isArray(value)) { value.forEach((entry, index) => validateRecordFields(entry, `${path}[${index}]`, issues)); return; }
  if (!isRecord(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    const nestedPath = `${path}.${key}`;
    if (typeof nested === 'string' && /(At|Timestamp|timestamp)$/.test(key) && Number.isNaN(Date.parse(nested))) {
      issues.push(issue('invalid-timestamp', 'التاريخ أو الوقت في السجل غير صالح.', 'error', path));
    }
    validateRecordFields(nested, nestedPath, issues);
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function issue(code: string, message: string, severity: ImportIssueSeverity, store?: string, recordId?: string): ImportIssue {
  return { code, message, severity, ...(store ? { store } : {}), ...(recordId ? { recordId } : {}) };
}

function normalizeEnvelope(input: unknown): { envelope: ProductExportEnvelope | null; issues: ImportIssue[]; migrationSteps: string[] } {
  if (!isRecord(input)) return { envelope: null, issues: [issue('invalid-envelope', 'ملف الاستيراد ليس كائنًا صالحًا.', 'error')], migrationSteps: [] };
  if (hasForbiddenField(input)) return { envelope: null, issues: [issue('forbidden-field', 'يحتوي الملف على حقول خارج حدود البيانات المحلية المسموح بها.', 'error')], migrationSteps: [] };

  const exportVersion = input.exportVersion;
  const schemaVersion = input.schemaVersion;
  const stores = input.stores;
  const issues: ImportIssue[] = [];
  const migrationSteps: string[] = [];
  if (exportVersion !== 1) {
    if (exportVersion === undefined && schemaVersion === 1 && isRecord(stores)) {
      migrationSteps.push('تطبيع ملف النسخة القديمة إلى غلاف التصدير v1.');
    } else {
      issues.push(issue('unsupported-export-version', 'إصدار ملف التصدير غير مدعوم.', 'error'));
    }
  }
  if (schemaVersion !== 1) issues.push(issue('unsupported-schema-version', 'إصدار مخطط البيانات غير مدعوم.', 'error'));
  if (!isRecord(stores)) issues.push(issue('missing-stores', 'لا توجد مخازن بيانات قابلة للاستيراد.', 'error'));
  if (issues.some((entry) => entry.severity === 'error')) return { envelope: null, issues, migrationSteps };

  const sourceStores = stores as Record<string, unknown>;

  const normalizedStores: Record<string, readonly unknown[]> = {};
  for (const storeName of DOMAIN_STORES) {
    const records = sourceStores[storeName];
    if (records === undefined) continue;
    if (!Array.isArray(records)) {
      issues.push(issue('invalid-store', 'مخزن البيانات ليس قائمة سجلات.', 'error', storeName));
      continue;
    }
    const seen = new Set<string>();
    normalizedStores[storeName] = records.map((record) => {
      if (!isRecord(record) || typeof record.id !== 'string' || !record.id.trim()) {
        issues.push(issue('invalid-record', 'كل سجل يحتاج إلى معرّف محلي غير فارغ.', 'error', storeName));
        return record;
      }
      if (seen.has(record.id)) issues.push(issue('duplicate-id', 'المعرّف مكرر داخل المخزن.', 'error', storeName, record.id));
      seen.add(record.id);
      if (hasForbiddenField(record)) issues.push(issue('forbidden-field', 'السجل يحتوي على حقل غير مسموح.', 'error', storeName, record.id));
      validateRecordFields(record, storeName, issues);
      return clone(record);
    });
  }
  for (const storeName of Object.keys(sourceStores)) {
    if (!DOMAIN_STORES.includes(storeName as (typeof DOMAIN_STORES)[number])) issues.push(issue('unknown-store', 'المخزن غير معروف وتم رفضه.', 'error', storeName));
  }

  const idsByStore = new Map(Object.entries(normalizedStores).map(([name, records]) => [name, new Set(records.flatMap((record) => isRecord(record) && typeof record.id === 'string' ? [record.id] : []))]));
  const referenceRules: readonly [string, string, string][] = [
    ['readingPlans', 'bookId', 'books'],
    ['readingPlans', 'protocolSnapshotId', 'protocolSnapshots'],
    ['sessions', 'planId', 'readingPlans'],
    ['sessionSteps', 'sessionId', 'sessions'],
    ['learningArtifacts', 'sessionId', 'sessions'],
    ['distractionEvents', 'sessionId', 'sessions'],
  ];
  for (const [storeName, field, targetStore] of referenceRules) {
    for (const record of normalizedStores[storeName] ?? []) {
      if (!isRecord(record) || typeof record[field] !== 'string') continue;
      if (!idsByStore.get(targetStore)?.has(record[field])) issues.push(issue('missing-reference', `المرجع ${field} غير موجود في الملف.`, 'error', storeName, typeof record.id === 'string' ? record.id : undefined));
    }
  }
  const envelope: ProductExportEnvelope = {
    exportVersion: 1,
    schemaVersion: 1,
    exportedAt: typeof input.exportedAt === 'string' ? input.exportedAt : new Date(0).toISOString(),
    recordCounts: Object.fromEntries(Object.entries(normalizedStores).map(([name, records]) => [name, records.length])),
    stores: normalizedStores,
  };
  if (isRecord(input.recordCounts)) {
    for (const [storeName, count] of Object.entries(envelope.recordCounts)) {
      if (input.recordCounts[storeName] !== undefined && input.recordCounts[storeName] !== count) {
        issues.push(issue('count-mismatch', 'عدد السجلات المعلن لا يطابق محتوى المخزن.', 'error', storeName));
      }
    }
  }
  return { envelope, issues, migrationSteps };
}

export function previewImport(input: unknown): ImportPreview {
  const result = normalizeEnvelope(input);
  const errors = result.issues.filter((entry) => entry.severity === 'error');
  return { ok: Boolean(result.envelope) && errors.length === 0, envelope: result.envelope, counts: result.envelope?.recordCounts ?? {}, issues: result.issues, migrationSteps: result.migrationSteps };
}

export interface ImportResult {
  readonly importedCounts: Readonly<Record<string, number>>;
  readonly rolledBack: boolean;
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Import transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Import transaction aborted.'));
  });
}

async function replaceStores(stores: Record<string, readonly unknown[]>): Promise<void> {
  const database = await openReadingHelperDatabase();
  try {
    const transaction = database.transaction([...DOMAIN_STORES], 'readwrite');
    for (const storeName of DOMAIN_STORES) {
      const store = transaction.objectStore(storeName);
      store.clear();
      for (const record of stores[storeName] ?? []) store.put(record);
    }
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function importProductData(input: unknown): Promise<ImportResult> {
  await assertRuntimeWritable();
  const preview = previewImport(input);
  if (!preview.ok || !preview.envelope) throw new Error('Import preview rejected the payload.');
  const backup = await exportDomainData();
  beginImportJournal();
  try {
    markImportCommitting();
    await replaceStores(preview.envelope.stores);
    const committed = await exportDomainData();
    const committedPreview = previewImport({ ...preview.envelope, stores: committed });
    const countsMatch = Object.entries(preview.counts).every(([storeName, count]) => committedPreview.counts[storeName] === count);
    if (!committedPreview.ok || !countsMatch) throw new Error('Post-commit verification failed.');
    clearImportJournal();
    return { importedCounts: preview.counts, rolledBack: false };
  } catch (error) {
    markImportRollbackRequired();
    try { await replaceStores(backup); } catch { /* preserve the original failure; the database remains guarded by the write gate */ }
    clearImportJournal();
    throw error;
  }
}

export function parseImportText(text: string): ImportPreview {
  if (text.length > MAX_IMPORT_TEXT_LENGTH) return { ok: false, envelope: null, counts: {}, issues: [issue('payload-too-large', 'ملف الاستيراد أكبر من الحد المحلي المسموح.', 'error')], migrationSteps: [] };
  try { return previewImport(JSON.parse(text) as unknown); } catch { return { ok: false, envelope: null, counts: {}, issues: [issue('invalid-json', 'ملف JSON غير صالح.', 'error')], migrationSteps: [] }; }
}

export const IMPORT_DATABASE_NAME = READING_HELPER_DATABASE_NAME;
export const IMPORT_DATABASE_VERSION = READING_HELPER_DATABASE_VERSION;
