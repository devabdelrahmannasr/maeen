import type { Book } from './book';
import type { BookRepository } from './bookRepository';

export interface LibraryBookRow {
  readonly book: Book;
  readonly archived: boolean;
}

export async function queryLibrary(repository: BookRepository): Promise<readonly LibraryBookRow[]> {
  const books = await repository.list(true);
  return [...books]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((book) => ({ book, archived: Boolean(book.archivedAt) }));
}
