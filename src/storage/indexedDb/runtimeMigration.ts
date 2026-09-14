import { CURRENT_DATA_SCHEMA_VERSION, resolveMigrationState, type MigrationState } from './migrations';
import { READING_HELPER_DATABASE_NAME } from './database';

interface DatabaseInfoLike {
  readonly name?: string;
  readonly version?: number;
}

interface IndexedDbFactoryWithDatabases {
  databases?: () => Promise<readonly DatabaseInfoLike[]>;
}

/** Inspects the installed database without opening or mutating it. */
export async function inspectRuntimeMigrationState(factory: IDBFactory = globalThis.indexedDB): Promise<MigrationState> {
  if (!factory) return { mode: 'writable', version: CURRENT_DATA_SCHEMA_VERSION };
  const databaseFactory = factory as unknown as IndexedDbFactoryWithDatabases;
  if (!databaseFactory.databases) return { mode: 'writable', version: CURRENT_DATA_SCHEMA_VERSION };
  try {
    const databases = await databaseFactory.databases();
    const installed = databases.find((database) => database.name === READING_HELPER_DATABASE_NAME);
    return installed?.version && installed.version > CURRENT_DATA_SCHEMA_VERSION
      ? resolveMigrationState(installed.version)
      : { mode: 'writable', version: installed?.version ?? CURRENT_DATA_SCHEMA_VERSION };
  } catch {
    return { mode: 'read-only', version: null, error: 'migration-inspection-failed' };
  }
}

export async function assertRuntimeWritable(factory?: IDBFactory): Promise<void> {
  const state = await inspectRuntimeMigrationState(factory);
  if (state.mode !== 'writable') throw new Error(`Data store is read-only: ${state.error ?? 'migration-failed'}`);
}
