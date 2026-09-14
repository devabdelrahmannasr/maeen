import type { Book } from './book';

export interface BookRepository {
  get(id: string): Promise<Book | null>;
  list(includeArchived?: boolean): Promise<readonly Book[]>;
  save(book: Book): Promise<void>;
}
