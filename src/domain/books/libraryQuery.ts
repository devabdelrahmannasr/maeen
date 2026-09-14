import type { Book } from './book';
import type { BookRepository } from './bookRepository';
import type { ReadingPlanRepository } from '../planning/readingPlanRepository';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';
import { resolveBookResume } from './resolveBookResume';
import type { AppRoute } from '../../navigation/routes';

export interface LibraryBookRow {
  readonly book: Book;
  readonly archived: boolean;
  readonly activePlan?: ReadingPlan;
  readonly latestSession?: Session;
  readonly resumeRoute: AppRoute;
}

export interface LibraryQueryDependencies {
  readonly plans?: ReadingPlanRepository;
  readonly sessions?: { list(): Promise<readonly Session[]> };
}

export async function queryLibrary(repository: BookRepository, dependencies: LibraryQueryDependencies = {}): Promise<readonly LibraryBookRow[]> {
  const books = await repository.list(true);
  const sessions = dependencies.sessions ? await dependencies.sessions.list() : [];
  return Promise.all([...books].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).map(async (book) => {
    const plans = dependencies.plans ? await dependencies.plans.listForBook(book.id) : [];
    const activePlan = plans.find((plan) => plan.status === 'active');
    const latestSession = sessions.filter((session) => activePlan ? session.planId === activePlan.id : plans.some((plan) => plan.id === session.planId)).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
    return { book, archived: Boolean(book.archivedAt), ...(activePlan ? { activePlan } : {}), ...(latestSession ? { latestSession } : {}), resumeRoute: resolveBookResume(book, activePlan ?? null, latestSession ?? null) };
  }));
}
