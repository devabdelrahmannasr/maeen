import type { BookMetadata } from './bookMetadata';

export const BOOK_FINGERPRINT_VERSION = 1 as const;

export function bookFingerprint(metadata: BookMetadata): string {
  const canonical = JSON.stringify({ version: BOOK_FINGERPRINT_VERSION, title: metadata.title.toLocaleLowerCase(), author: metadata.author?.toLocaleLowerCase() ?? '', totalPages: metadata.totalPages });
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) hash = Math.imul(hash ^ canonical.charCodeAt(index), 16777619);
  return `book-${BOOK_FINGERPRINT_VERSION}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export interface DuplicateCandidate {
  readonly id: string;
  readonly exactMetadataMatch: boolean;
}

/** Hash matches are warnings only; callers must confirm normalized metadata. */
export function findDuplicateCandidates(metadata: BookMetadata, books: readonly { id: string; metadata: BookMetadata; fingerprint: string }[]): readonly DuplicateCandidate[] {
  const fingerprint = bookFingerprint(metadata);
  return books
    .filter((book) => book.fingerprint === fingerprint)
    .map((book) => ({ id: book.id, exactMetadataMatch: JSON.stringify(book.metadata) === JSON.stringify(metadata) }));
}
