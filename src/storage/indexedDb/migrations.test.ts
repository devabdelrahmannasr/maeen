import { describe, expect, it } from 'vitest';
import { migrateDataVersion, readOnlyAfterMigrationFailure } from './migrations';

describe('data migrations', () => {
  it('accepts current and older versions idempotently', () => {
    expect(migrateDataVersion(0)).toEqual({ ok: true, version: 1 });
    expect(migrateDataVersion(1)).toEqual({ ok: true, version: 1 });
  });
  it('enters read-only mode for unsupported versions', () => {
    const result = migrateDataVersion(99);
    expect(result.ok).toBe(false);
    expect(readOnlyAfterMigrationFailure(result)).toBe(true);
  });
});
