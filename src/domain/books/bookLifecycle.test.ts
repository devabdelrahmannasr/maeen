import { describe, expect, it } from 'vitest';
import { archiveBook, createBook, restoreBook, updateBook } from './bookLifecycle';
import type { Book } from './book';
import type { BookRepository } from './bookRepository';

function repository(initial: Book[] = []): BookRepository & { values: Book[] } {
  const values = initial;
  return { values, get: async (id) => values.find((book) => book.id === id) ?? null, list: async () => values, save: async (book) => { const index = values.findIndex((candidate) => candidate.id === book.id); if (index >= 0) values[index] = book; else values.push(book); } };
}

describe('book lifecycle', () => {
  it('creates, edits, archives, and restores', async () => {
    const store = repository();
    let id = 0;
    const dependencies = { repository: store, createId: () => `book-${++id}`, now: () => '2026-09-14T00:00:00.000Z' };
    const created = await createBook({ title: '  Book ', totalPages: 10 }, dependencies);
    const edited = await updateBook(created, { title: 'Book 2', totalPages: 11 }, dependencies);
    const archived = await archiveBook(edited, dependencies);
    expect(archived.archivedAt).toBeDefined();
    const restored = await restoreBook(archived, dependencies);
    expect(restored.archivedAt).toBeUndefined();
    expect(store.values).toHaveLength(1);
  });

  it('requires explicit confirmation for an exact duplicate', async () => {
    const store = repository();
    const dependencies = { repository: store, createId: () => `book-${store.values.length + 1}`, now: () => '2026-09-14T00:00:00.000Z' };
    await createBook({ title: 'Book', totalPages: 10 }, dependencies);
    await expect(createBook({ title: ' Book ', totalPages: 10 }, dependencies)).rejects.toThrow('duplicate-confirmation-required');
    await expect(createBook({ title: ' Book ', totalPages: 10 }, dependencies, { confirmDuplicate: true })).resolves.toBeDefined();
  });
});
