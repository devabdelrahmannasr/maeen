export const CURRENT_DATA_SCHEMA_VERSION = 1 as const;

export interface MigrationContext {
  readonly fromVersion: number;
  readonly toVersion: number;
}

export type MigrationResult = { readonly ok: true; readonly version: number } | { readonly ok: false; readonly error: string };

export type DataAccessMode = 'writable' | 'read-only';

export interface MigrationState {
  readonly mode: DataAccessMode;
  readonly version: number | null;
  readonly error?: string;
}

export function migrateDataVersion(version: number): MigrationResult {
  if (!Number.isInteger(version) || version < 0 || version > CURRENT_DATA_SCHEMA_VERSION) return { ok: false, error: 'unsupported-version' };
  return { ok: true, version: CURRENT_DATA_SCHEMA_VERSION };
}

export function readOnlyAfterMigrationFailure(result: MigrationResult): boolean {
  return !result.ok;
}

export function resolveMigrationState(version: number): MigrationState {
  const result = migrateDataVersion(version);
  return result.ok
    ? { mode: 'writable', version: result.version }
    : { mode: 'read-only', version: null, error: result.error };
}

export function assertWritable(state: MigrationState): void {
  if (state.mode !== 'writable') throw new Error(`Data store is read-only: ${state.error ?? 'migration-failed'}`);
}
