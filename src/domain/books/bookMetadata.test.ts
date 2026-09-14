import { describe, expect, it } from 'vitest';
import { validateBookMetadata } from './bookMetadata';

describe('validateBookMetadata', () => {
  it('normalizes whitespace without mutating input', () => {
    const input = { title: '  A   Book ', author: ' A ', totalPages: 10 };
    expect(validateBookMetadata(input)).toEqual({ ok: true, metadata: { title: 'A Book', author: 'A', totalPages: 10 } });
    expect(input).toEqual({ title: '  A   Book ', author: ' A ', totalPages: 10 });
  });

  it('rejects invalid metadata', () => {
    expect(validateBookMetadata({ title: '', totalPages: 0 })).toMatchObject({ ok: false });
    expect(validateBookMetadata({ title: 'Book', totalPages: 1, referenceUrl: 'javascript:alert(1)' })).toMatchObject({ ok: false });
  });
});
