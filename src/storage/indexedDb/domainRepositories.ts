import type { Book } from '../../domain/books/book';
import type { BookRepository } from '../../domain/books/bookRepository';
import type { ReadingPlan } from '../../domain/planning/readingPlan';
import type { ReadingPlanRepository } from '../../domain/planning/readingPlanRepository';
import { createEntityRepository, type EntityRepository } from './repository';
import { openReadingHelperDatabase } from './database';
import { assertRuntimeWritable } from './runtimeMigration';
import type { ProtocolSnapshot } from '../../domain/protocols/protocolSnapshot';
import type { Session } from '../../domain/sessions/session';
import type { SessionStep, LearningArtifact, DistractionEvent } from '../../domain/sessions/sessionRecords';

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
  if (!plan.id || !plan.bookId || !snapshot.id || !snapshot.protocolId) throw new Error('Invalid plan or protocol snapshot.');
  await assertRuntimeWritable();
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
export function createLearningArtifactRepository() {
  const repository = createEntityRepository<LearningArtifact>('learningArtifacts');
  return {
    get: repository.get,
    list: repository.list,
    async listForSession(sessionId: string) {
      return (await repository.list()).filter((artifact) => artifact.sessionId === sessionId);
    },
    async listByType(type: LearningArtifact['type']) {
      return (await repository.list()).filter((artifact) => artifact.type === type);
    },
    save: repository.save,
  };
}

export function createDistractionEventRepository() {
  const repository = createEntityRepository<DistractionEvent>('distractionEvents');
  return {
    get: repository.get,
    list: repository.list,
    async listForSession(sessionId: string) {
      return (await repository.list()).filter((event) => event.sessionId === sessionId);
    },
    save: repository.save,
  };
}

export async function saveSessionBundle(session: Session, step: SessionStep, artifact?: LearningArtifact): Promise<void> {
  if (!session.id || !session.planId || !step.id || step.sessionId !== session.id) throw new Error('Invalid session bundle.');
  await assertRuntimeWritable();
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

export async function saveSessionArtifactsBundle(
  session: Session,
  steps: readonly SessionStep[] = [],
  artifacts: readonly LearningArtifact[] = [],
  distractions: readonly DistractionEvent[] = [],
): Promise<void> {
  if (!session.id || !session.planId) throw new Error('Invalid session bundle.');
  if (steps.some((step) => step.sessionId !== session.id) || artifacts.some((artifact) => artifact.sessionId !== session.id) || distractions.some((event) => event.sessionId !== session.id)) throw new Error('Session bundle contains a foreign record.');
  await assertRuntimeWritable();
  const database = await openReadingHelperDatabase();
  try {
    const transaction = database.transaction(['sessions', 'sessionSteps', 'learningArtifacts', 'distractionEvents'], 'readwrite');
    transaction.objectStore('sessions').put(session);
    for (const step of steps) transaction.objectStore('sessionSteps').put(step);
    for (const artifact of artifacts) transaction.objectStore('learningArtifacts').put(artifact);
    for (const distraction of distractions) transaction.objectStore('distractionEvents').put(distraction);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
    });
  } finally {
    database.close();
  }
}
