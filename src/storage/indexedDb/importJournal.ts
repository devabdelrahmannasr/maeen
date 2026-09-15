const IMPORT_JOURNAL_KEY = 'reading-helper.import-journal.v1';

export type ImportJournalPhase = 'prepared' | 'committing' | 'rollback-required';

export interface ImportJournal {
  readonly version: 1;
  readonly phase: ImportJournalPhase;
  readonly startedAt: string;
}

function storage(): Storage | null {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function beginImportJournal(startedAt = new Date().toISOString()): void {
  storage()?.setItem(IMPORT_JOURNAL_KEY, JSON.stringify({ version: 1, phase: 'prepared', startedAt } satisfies ImportJournal));
}

export function markImportCommitting(): void {
  const current = readImportJournal();
  if (!current) return;
  storage()?.setItem(IMPORT_JOURNAL_KEY, JSON.stringify({ ...current, phase: 'committing' } satisfies ImportJournal));
}

export function markImportRollbackRequired(): void {
  const current = readImportJournal();
  if (!current) return;
  storage()?.setItem(IMPORT_JOURNAL_KEY, JSON.stringify({ ...current, phase: 'rollback-required' } satisfies ImportJournal));
}

export function readImportJournal(): ImportJournal | null {
  const raw = storage()?.getItem(IMPORT_JOURNAL_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ImportJournal>;
    if (parsed.version !== 1 || !parsed.startedAt || !['prepared', 'committing', 'rollback-required'].includes(parsed.phase ?? '')) return null;
    return parsed as ImportJournal;
  } catch { return null; }
}

export function clearImportJournal(): void {
  storage()?.removeItem(IMPORT_JOURNAL_KEY);
}

export const IMPORT_JOURNAL_STORAGE_KEY = IMPORT_JOURNAL_KEY;
