import { describe, expect, it } from 'vitest';
import { bookFingerprint, findDuplicateCandidates } from './bookFingerprint';

describe('duplicate detection', () => {
  it('returns warnings and requires normalized metadata confirmation', () => {
    const metadata = { title: 'A book', totalPages: 10 } as const;
    const candidate = { id: 'book-1', metadata, fingerprint: bookFingerprint(metadata) };
    expect(findDuplicateCandidates(metadata, [candidate])).toEqual([{ id: 'book-1', exactMetadataMatch: true }]);
    expect(findDuplicateCandidates({ title: 'A book', totalPages: 11 }, [candidate])).toEqual([]);
  });
});
