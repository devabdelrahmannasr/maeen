import type { Book } from '../../domain/books/book';
import type { BookRepository } from '../../domain/books/bookRepository';
import type { ReadingPlan } from '../../domain/planning/readingPlan';
import type { ReadingPlanRepository } from '../../domain/planning/readingPlanRepository';
import { createEntityRepository, type EntityRepository } from './repository';
import { openReadingHelperDatabase } from './database';
import type { ProtocolSnapshot } from '../../domain/protocols/protocolSnapshot';
import type { Session } from '../../domain/sessions/session';
import type { SessionStep, LearningArtifact } from '../../domain/sessions/sessionRecords';

export function createBookRepository(): BookRepository {
  const repository = createEntityRepository<Book>('books');
  return {
    get: repository.get,
    async list(includeArchived = false) {
      const books = await repository.list();
      return includeArchived ? books : books.filter((book) => !book.archivedAt);
    },
    save: repository.save,
  };
}

export function createReadingPlanRepository(): ReadingPlanRepository {
  const repository: EntityRepository<ReadingPlan> = createEntityRepository<ReadingPlan>('readingPlans');
  return {
    get: repository.get,
    async listForBook(bookId) {
      const plans = await repository.list();
      return plans.filter((plan) => plan.bookId === bookId);
    },
    save: repository.save,
  };
}

/** Commits the plan and its immutable snapshot in one IndexedDB transaction. */
export async function saveReadingPlanAndSnapshot(plan: ReadingPlan, snapshot: ProtocolSnapshot): Promise<void> {
  const database = await openReadingHelperDatabase();
  try {
    const transaction = database.transaction(['readingPlans', 'protocolSnapshots'], 'readwrite');
    transaction.objectStore('protocolSnapshots').put(snapshot);
    transaction.objectStore('readingPlans').put(plan);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
    });
  } finally {
    database.close();
  }
}

export const createProtocolSnapshotRepository = () => createEntityRepository<ProtocolSnapshot>('protocolSnapshots');
export const createSessionRepository = () => createEntityRepository<Session>('sessions');

export async function saveSessionBundle(session: Session, step: SessionStep, artifact?: LearningArtifact): Promise<void> {
  const database = await openReadingHelperDatabase();
  try {
    const stores = artifact ? ['sessions', 'sessionSteps', 'learningArtifacts'] : ['sessions', 'sessionSteps'];
    const transaction = database.transaction(stores, 'readwrite');
    transaction.objectStore('sessions').put(session);
    transaction.objectStore('sessionSteps').put(step);
    if (artifact) transaction.objectStore('learningArtifacts').put(artifact);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
    });
  } finally {
    database.close();
  }
}
