import 'fake-indexeddb/auto';
import { describe, expect, it, afterEach } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import { openReadingHelperDatabase, READING_HELPER_DATABASE_NAME, DOMAIN_STORES } from './database';
import { createEntityRepository } from './repository';
import { saveReadingPlanAndSnapshot } from './domainRepositories';

afterEach(async () => {
  await new Promise<void>((resolve) => { const request = indexedDB.deleteDatabase(READING_HELPER_DATABASE_NAME); request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve(); });
});

describe('IndexedDB domain storage', () => {
  it('creates every domain store and persists records across connections', async () => {
    const database = await openReadingHelperDatabase();
    expect([...database.objectStoreNames]).toEqual(expect.arrayContaining([...DOMAIN_STORES]));
    database.close();
    const repository = createEntityRepository<{ id: string; label: string }>('books');
    await repository.save({ id: 'book-1', label: 'local' });
    await expect(repository.get('book-1')).resolves.toEqual({ id: 'book-1', label: 'local' });
  });

  it('commits a plan and snapshot as one transaction and rolls back invalid writes', async () => {
    const snapshot = { id: 'snapshot-1', protocolId: 'exam-study' } as never;
    const plan = { id: 'plan-1', bookId: 'book-1' } as never;
    await saveReadingPlanAndSnapshot(plan, snapshot);
    const snapshots = createEntityRepository<{ id: string; protocolId: string }>('protocolSnapshots');
    await expect(snapshots.get('snapshot-1')).resolves.toEqual(snapshot);
    await expect(saveReadingPlanAndSnapshot({} as never, { id: 'snapshot-2' } as never)).rejects.toBeDefined();
    await expect(snapshots.get('snapshot-2')).resolves.toBeNull();
  });
});
