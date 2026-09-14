import { describe, expect, it } from 'vitest';
import { queryLibrary } from './libraryQuery';
import { resolveBookResume } from './resolveBookResume';
import type { Book } from './book';

const book = (id: string, archivedAt?: string): Book => ({ schemaVersion: 1, id, metadata: { title: id, totalPages: 10 }, fingerprint: id, createdAt: '2026-09-14T00:00:00.000Z', updatedAt: `2026-09-14T00:0${id.length}:00.000Z`, ...(archivedAt ? { archivedAt } : {}) });

describe('library query and resume', () => {
  it('separates active and archived books', async () => {
    const rows = await queryLibrary({ get: async () => null, list: async () => [book('a'), book('b', '2026-09-14T00:00:00.000Z')], save: async () => {} });
    expect(rows.find((row) => row.book.id === 'b')?.archived).toBe(true);
  });

  it('opens the safest available continuation', () => {
    expect(resolveBookResume(book('a'), null, null)).toEqual({ name: 'book-progress', bookId: 'a' });
  });
});
