export const READING_HELPER_DATABASE_NAME = 'reading-helper-local';
export const READING_HELPER_DATABASE_VERSION = 1;

export const DOMAIN_STORES = [
  'books', 'readingPlans', 'protocolSnapshots', 'sessions', 'sessionSteps',
  'learningArtifacts', 'distractionEvents',
] as const;

type DomainStoreName = (typeof DOMAIN_STORES)[number];

const indexes: Readonly<Record<DomainStoreName, readonly string[]>> = {
  books: ['fingerprint', 'archivedAt'],
  readingPlans: ['bookId', 'status'],
  protocolSnapshots: ['protocolId', 'createdAt'],
  sessions: ['planId', 'status', 'updatedAt'],
  sessionSteps: ['sessionId', 'status'],
  learningArtifacts: ['sessionId', 'type'],
  distractionEvents: ['sessionId', 'timestamp'],
};

export function openReadingHelperDatabase(factory: IDBFactory = globalThis.indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!factory) { reject(new Error('IndexedDB is unavailable.')); return; }
    const request = factory.open(READING_HELPER_DATABASE_NAME, READING_HELPER_DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      for (const storeName of DOMAIN_STORES) {
        const store = database.objectStoreNames.contains(storeName)
          ? request.transaction?.objectStore(storeName)
          : database.createObjectStore(storeName, { keyPath: 'id' });
        for (const indexName of indexes[storeName]) {
          if (store && !store.indexNames.contains(indexName)) store.createIndex(indexName, indexName, { unique: false });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened.'));
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked.'));
  });
}

export function closeReadingHelperDatabase(database: IDBDatabase): void {
  database.close();
}
