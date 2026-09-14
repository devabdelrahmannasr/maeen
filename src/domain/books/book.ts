import type { BookMetadata } from './bookMetadata';

export const BOOK_SCHEMA_VERSION = 1 as const;

export interface Book {
  readonly schemaVersion: typeof BOOK_SCHEMA_VERSION;
  readonly id: string;
  readonly metadata: BookMetadata;
  readonly fingerprint: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
}

export function isBookArchived(book: Book): boolean {
  return typeof book.archivedAt === 'string';
}
