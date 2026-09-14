import { describe, expect, it } from 'vitest';
import { bookFingerprint } from './bookFingerprint';

describe('bookFingerprint', () => {
  it('is deterministic from metadata only', () => {
    const metadata = { title: 'A Book', author: 'A', totalPages: 10 } as const;
    expect(bookFingerprint(metadata)).toBe(bookFingerprint({ ...metadata }));
    expect(bookFingerprint(metadata)).not.toBe(bookFingerprint({ ...metadata, totalPages: 11 }));
  });
});
