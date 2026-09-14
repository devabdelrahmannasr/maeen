import type { AppRoute } from '../../navigation/routes';
import type { Book } from './book';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';

export function resolveBookResume(book: Book, plan: ReadingPlan | null, session: Session | null): AppRoute {
  if (session && session.status !== 'completed' && session.status !== 'abandoned') return { name: 'focus-session', sessionId: session.id };
  if (plan && plan.status === 'active') return { name: 'protocol-preview', planId: plan.id };
  return { name: 'book-progress', bookId: book.id };
}
