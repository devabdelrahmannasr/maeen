import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { openReadingHelperDatabase } from './database';
import { createProductExportEnvelope } from './dataExport';
import { importProductData, parseImportText, previewImport } from './dataImport';

describe('data import', () => {
  beforeEach(async () => {
    const database = await openReadingHelperDatabase();
    const transaction = database.transaction(['books', 'readingPlans', 'protocolSnapshots', 'sessions', 'sessionSteps', 'learningArtifacts', 'distractionEvents'], 'readwrite');
    for (const storeName of ['books', 'readingPlans', 'protocolSnapshots', 'sessions', 'sessionSteps', 'learningArtifacts', 'distractionEvents']) transaction.objectStore(storeName).clear();
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
    database.close();
  });

  it('previews valid data deterministically without mutating input', () => {
    const input = createProductExportEnvelope({ books: [{ id: 'book-1', title: 'كتاب' }] }, '2026-09-15T00:00:00.000Z');
    const before = JSON.stringify(input);
    const preview = previewImport(input);
    expect(preview.ok).toBe(true);
    expect(preview.counts.books).toBe(1);
    expect(JSON.stringify(input)).toBe(before);
  });

  it.each([
    ['invalid JSON', '{bad', 'invalid-json'],
    ['duplicate IDs', createProductExportEnvelope({ books: [{ id: 'same' }, { id: 'same' }] }, '2026-09-15T00:00:00.000Z'), 'duplicate-id'],
    ['forbidden PDF field', createProductExportEnvelope({ books: [{ id: 'book', pdfBytes: 'secret' }] }, '2026-09-15T00:00:00.000Z'), 'forbidden-field'],
  ])('rejects %s safely', (_label, value, code) => {
    const preview = typeof value === 'string' ? parseImportText(value) : previewImport(value);
    expect(preview.ok).toBe(false);
    expect(preview.issues.some((entry) => entry.code === code)).toBe(true);
  });

  it('rejects missing references before any write', () => {
    const preview = previewImport(createProductExportEnvelope({ readingPlans: [{ id: 'plan', bookId: 'missing', protocolSnapshotId: 'snapshot' }] }, '2026-09-15T00:00:00.000Z'));
    expect(preview.ok).toBe(false);
    expect(preview.issues.filter((entry) => entry.code === 'missing-reference')).toHaveLength(2);
  });

  it('rejects count drift, invalid timestamps, and oversized text before writes', () => {
    const countDrift = previewImport({ ...createProductExportEnvelope({ books: [{ id: 'book' }] }, '2026-09-15T00:00:00.000Z'), recordCounts: { books: 2 } });
    expect(countDrift.issues.some((entry) => entry.code === 'count-mismatch')).toBe(true);
    const invalidTimestamp = previewImport(createProductExportEnvelope({ books: [{ id: 'book', createdAt: 'not-a-date' }] }, '2026-09-15T00:00:00.000Z'));
    expect(invalidTimestamp.issues.some((entry) => entry.code === 'invalid-timestamp')).toBe(true);
    const oversized = parseImportText(JSON.stringify(createProductExportEnvelope({ books: [{ id: 'book', note: 'x'.repeat(200_001) }] }, '2026-09-15T00:00:00.000Z')));
    expect(oversized.issues.some((entry) => entry.code === 'text-too-large')).toBe(true);
  });

  it('imports a valid envelope and re-reads committed counts', async () => {
    const result = await importProductData(createProductExportEnvelope({ books: [{ id: 'book', title: 'كتاب' }] }, '2026-09-15T00:00:00.000Z'));
    expect(result).toEqual({ importedCounts: { books: 1 }, rolledBack: false });
  });
});
