import { describe, expect, it } from 'vitest';
import { assertWritable, migrateDataVersion, readOnlyAfterMigrationFailure, resolveMigrationState } from './migrations';

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
  it('enforces the read-only gate after a failed migration', () => {
    const state = resolveMigrationState(2);
    expect(state).toMatchObject({ mode: 'read-only', version: null });
    expect(() => assertWritable(state)).toThrow('read-only');
    expect(() => assertWritable(resolveMigrationState(1))).not.toThrow();
  });
});
