import { DOMAIN_STORES, READING_HELPER_DATABASE_NAME } from './database';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB export request failed.'));
  });
}

/** Reads existing records for a user-owned backup without upgrading the database. */
export async function exportDomainData(factory: IDBFactory = globalThis.indexedDB): Promise<Record<string, readonly unknown[]>> {
  if (!factory) throw new Error('IndexedDB is unavailable.');
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(READING_HELPER_DATABASE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened for export.'));
  });
  try {
    const stores = DOMAIN_STORES.filter((storeName) => database.objectStoreNames.contains(storeName));
    if (stores.length === 0) return {};
    const transaction = database.transaction(stores, 'readonly');
    const entries = await Promise.all(stores.map(async (storeName) => [storeName, await requestResult(transaction.objectStore(storeName).getAll())] as const));
    return Object.fromEntries(entries);
  } finally {
    database.close();
  }
}

export function downloadDomainBackup(payload: Record<string, readonly unknown[]>): void {
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), stores: payload }, null, 2)], { type: 'application/json' }));
  link.href = objectUrl;
    link.download = 'maeen-backup.json';
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export const PRODUCT_EXPORT_VERSION = 1 as const;

export interface ProductExportEnvelope {
  readonly exportVersion: typeof PRODUCT_EXPORT_VERSION;
  readonly schemaVersion: number;
  readonly exportedAt: string;
  readonly recordCounts: Readonly<Record<string, number>>;
  readonly stores: Record<string, readonly unknown[]>;
}

function sortRecords(records: readonly unknown[]): readonly unknown[] {
  return [...records].sort((left, right) => {
    const leftId = typeof left === 'object' && left !== null && 'id' in left ? String((left as { id?: unknown }).id ?? '') : '';
    const rightId = typeof right === 'object' && right !== null && 'id' in right ? String((right as { id?: unknown }).id ?? '') : '';
    return leftId.localeCompare(rightId);
  });
}

export function createProductExportEnvelope(stores: Record<string, readonly unknown[]>, exportedAt: string, schemaVersion = 1): ProductExportEnvelope {
  const orderedStores = Object.fromEntries(Object.keys(stores).sort().map((storeName) => [storeName, sortRecords(stores[storeName] ?? [])]));
  return {
    exportVersion: PRODUCT_EXPORT_VERSION,
    schemaVersion,
    exportedAt,
    recordCounts: Object.fromEntries(Object.entries(orderedStores).map(([storeName, records]) => [storeName, records.length])),
    stores: orderedStores,
  };
}

export async function exportProductData(now: () => string = () => new Date().toISOString()): Promise<ProductExportEnvelope> {
  const stores = await exportDomainData();
  return createProductExportEnvelope(stores, now());
}

export function serializeProductExport(envelope: ProductExportEnvelope): string {
  return JSON.stringify(envelope, null, 2);
}

export function serializeMarkdownExport(envelope: ProductExportEnvelope): string {
  const lines = [
    '# Maeen backup',
    '',
    `Exported: ${envelope.exportedAt}`,
    `Schema version: ${envelope.schemaVersion}`,
    '',
    '## Record counts',
    ...Object.entries(envelope.recordCounts).map(([storeName, count]) => `- ${storeName}: ${count}`),
    '',
  ];
  for (const [storeName, records] of Object.entries(envelope.stores)) {
    lines.push(`## ${storeName}`, '');
    for (const record of records) {
      if (typeof record === 'object' && record !== null) {
        const typed = record as Record<string, unknown>;
        const label = typed.title ?? typed.name ?? typed.id ?? 'record';
        lines.push(`### ${String(label)}`);
        for (const [key, value] of Object.entries(typed).sort(([left], [right]) => left.localeCompare(right))) {
          if (key === 'id' || value === undefined || value === null || value === '') continue;
          lines.push(`- ${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
        }
        lines.push('');
      } else {
        lines.push(`- ${String(record)}`);
      }
    }
  }
  return `${lines.join('\n').trim()}\n`;
}

export function downloadExportFile(content: string, filename: string, mimeType: string, documentRef: Document = document): void {
  const link = documentRef.createElement('a');
  const objectUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
