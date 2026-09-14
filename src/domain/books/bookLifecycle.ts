import { bookFingerprint, findDuplicateCandidates } from './bookFingerprint';
import type { BookMetadataInput } from './bookMetadata';
import { validateBookMetadata } from './bookMetadata';
import type { Book } from './book';
import type { BookRepository } from './bookRepository';

export interface BookLifecycleDependencies {
  readonly repository: BookRepository;
  readonly createId: () => string;
  readonly now: () => string;
}

export interface CreateBookOptions { readonly confirmDuplicate?: boolean; }

export async function createBook(input: BookMetadataInput, dependencies: BookLifecycleDependencies, options: CreateBookOptions = {}): Promise<Book> {
  const validation = validateBookMetadata(input);
  if (!validation.ok) throw new Error(`Invalid book metadata: ${validation.errors.join(',')}`);
  const existing = await dependencies.repository.list(true);
  const duplicates = findDuplicateCandidates(validation.metadata, existing);
  if (duplicates.some((candidate) => candidate.exactMetadataMatch) && !options.confirmDuplicate) {
    throw new Error('duplicate-confirmation-required');
  }
  const timestamp = dependencies.now();
  const book: Book = { schemaVersion: 1, id: dependencies.createId(), metadata: validation.metadata, fingerprint: bookFingerprint(validation.metadata), createdAt: timestamp, updatedAt: timestamp };
  await dependencies.repository.save(book);
  return book;
}

export async function updateBook(book: Book, input: BookMetadataInput, dependencies: BookLifecycleDependencies): Promise<Book> {
  const validation = validateBookMetadata(input);
  if (!validation.ok) throw new Error(`Invalid book metadata: ${validation.errors.join(',')}`);
  const updated: Book = { ...book, metadata: validation.metadata, fingerprint: bookFingerprint(validation.metadata), updatedAt: dependencies.now() };
  await dependencies.repository.save(updated);
  return updated;
}

export async function archiveBook(book: Book, dependencies: BookLifecycleDependencies): Promise<Book> {
  if (book.archivedAt) return book;
  const timestamp = dependencies.now();
  const archived: Book = { ...book, archivedAt: timestamp, updatedAt: timestamp };
  await dependencies.repository.save(archived);
  return archived;
}

export async function restoreBook(book: Book, dependencies: BookLifecycleDependencies): Promise<Book> {
  if (!book.archivedAt) return book;
  const { archivedAt: _archivedAt, ...activeFields } = book;
  const restored: Book = { ...activeFields, updatedAt: dependencies.now() };
  await dependencies.repository.save(restored);
  return restored;
}
