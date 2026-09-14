import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import { READING_HELPER_DATABASE_NAME } from './database';
import { inspectRuntimeMigrationState } from './runtimeMigration';

afterEach(async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(READING_HELPER_DATABASE_NAME);
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });
});

describe('runtime migration inspection', () => {
  it('treats an absent database as writable at the current version', async () => {
    await expect(inspectRuntimeMigrationState(indexedDB)).resolves.toMatchObject({ mode: 'writable', version: 1 });
  });

  it('detects a future database version without opening it for writes', async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(READING_HELPER_DATABASE_NAME, 2);
      request.onsuccess = () => { request.result.close(); resolve(); };
      request.onerror = () => reject(request.error);
    });

    await expect(inspectRuntimeMigrationState(indexedDB)).resolves.toMatchObject({ mode: 'read-only', version: null, error: 'unsupported-version' });
  });
});
