import { DOMAIN_STORES, READING_HELPER_DATABASE_NAME } from './database';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB export request failed.'));
  });
}

/** Reads existing records for a user-owned backup without upgrading the database. */
export async function exportDomainData(factory: IDBFactory = globalThis.indexedDB): Promise<Record<string, readonly unknown[]>> {
  if (!factory) throw new Error('IndexedDB is unavailable.');
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(READING_HELPER_DATABASE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened for export.'));
  });
  try {
    const stores = DOMAIN_STORES.filter((storeName) => database.objectStoreNames.contains(storeName));
    if (stores.length === 0) return {};
    const transaction = database.transaction(stores, 'readonly');
    const entries = await Promise.all(stores.map(async (storeName) => [storeName, await requestResult(transaction.objectStore(storeName).getAll())] as const));
    return Object.fromEntries(entries);
  } finally {
    database.close();
  }
}

export function downloadDomainBackup(payload: Record<string, readonly unknown[]>): void {
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), stores: payload }, null, 2)], { type: 'application/json' }));
  link.href = objectUrl;
  link.download = 'reading-helper-backup.json';
  link.click();
  URL.revokeObjectURL(objectUrl);
}
