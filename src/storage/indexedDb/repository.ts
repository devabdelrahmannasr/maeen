import { openReadingHelperDatabase } from './database';
import { assertRuntimeWritable } from './runtimeMigration';

export interface EntityWithId { readonly id: string; }

export interface EntityRepository<T extends EntityWithId> {
  get(id: string): Promise<T | null>;
  list(): Promise<readonly T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

export function createEntityRepository<T extends EntityWithId>(storeName: string): EntityRepository<T> {
  return {
    async get(id) {
      const database = await openReadingHelperDatabase();
      try { return (await requestResult(database.transaction(storeName, 'readonly').objectStore(storeName).get(id))) as T | undefined ?? null; }
      finally { database.close(); }
    },
    async list() {
      const database = await openReadingHelperDatabase();
      try { return (await requestResult(database.transaction(storeName, 'readonly').objectStore(storeName).getAll())) as T[]; }
      finally { database.close(); }
    },
    async save(entity) {
      await assertRuntimeWritable();
      const database = await openReadingHelperDatabase();
      try {
        const transaction = database.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put(entity);
        await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.')); transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.')); });
      } finally { database.close(); }
    },
    async delete(id) {
      const database = await openReadingHelperDatabase();
      try {
        const transaction = database.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).delete(id);
        await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.')); transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.')); });
      } finally { database.close(); }
    },
  };
}
