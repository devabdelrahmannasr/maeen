import { describe, expect, it } from 'vitest';
import { createProductExportEnvelope, serializeMarkdownExport, serializeProductExport } from './dataExport';

describe('product export', () => {
  it('creates stable JSON and readable Markdown without mutating stores', () => {
    const stores = { sessions: [{ id: 'b', status: 'completed' }, { id: 'a', status: 'active' }], books: [{ id: 'book', title: 'كتاب' }] } as Record<string, readonly unknown[]>;
    const result = createProductExportEnvelope(stores, '2026-09-15T00:00:00.000Z');
    expect(Object.keys(result.stores)).toEqual(['books', 'sessions']);
    expect(result.stores.sessions?.[0]).toMatchObject({ id: 'a' });
    expect(serializeProductExport(result)).toContain('exportVersion');
    expect(serializeMarkdownExport(result)).toContain('كتاب');
    expect(stores.sessions?.[0]).toMatchObject({ id: 'b' });
  });
});
