export const CURRENT_DATA_SCHEMA_VERSION = 1 as const;

export interface MigrationContext {
  readonly fromVersion: number;
  readonly toVersion: number;
}

export type MigrationResult = { readonly ok: true; readonly version: number } | { readonly ok: false; readonly error: string };

export function migrateDataVersion(version: number): MigrationResult {
  if (!Number.isInteger(version) || version < 0 || version > CURRENT_DATA_SCHEMA_VERSION) return { ok: false, error: 'unsupported-version' };
  return { ok: true, version: CURRENT_DATA_SCHEMA_VERSION };
}

export function readOnlyAfterMigrationFailure(result: MigrationResult): boolean {
  return !result.ok;
}
