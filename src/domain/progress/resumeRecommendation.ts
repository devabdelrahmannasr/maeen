import type { AppRoute } from '../../navigation/routes';
import type { Book } from '../books/book';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';

export type ResumeReason = 'interrupted-session' | 'active-session' | 'active-plan' | 'book-progress' | 'archived-book' | 'missing-reference';
export interface ResumeRecommendation { readonly route: AppRoute; readonly reason: ResumeReason; readonly messageAr: string; }

export function recommendBookResume(book: Book | null, plan: ReadingPlan | null, sessions: readonly Session[] = []): ResumeRecommendation {
  if (!book) return { route: { name: 'library' }, reason: 'missing-reference', messageAr: 'تعذر العثور على المرجع؛ بياناتك محفوظة ويمكنك العودة إلى المكتبة.' };
  if (book.archivedAt) return { route: { name: 'book-progress', bookId: book.id }, reason: 'archived-book', messageAr: 'هذا الكتاب مؤرشف؛ راجع تقدمه أو استعده قبل المتابعة.' };
  const candidates = sessions.filter((session) => plan ? session.planId === plan.id : true).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  const interrupted = candidates.find((session) => session.status === 'interrupted');
  if (interrupted) return { route: { name: 'focus-session', sessionId: interrupted.id }, reason: 'interrupted-session', messageAr: 'استكمل من آخر خطوة آمنة محفوظة.' };
  const active = candidates.find((session) => !['completed', 'abandoned'].includes(session.status));
  if (active) return { route: { name: 'focus-session', sessionId: active.id }, reason: 'active-session', messageAr: 'لديك جلسة مستمرة؛ عد إلى آخر خطوة آمنة.' };
  if (plan?.status === 'active') return { route: { name: 'protocol-preview', planId: plan.id }, reason: 'active-plan', messageAr: 'الخطة جاهزة؛ راجع الطريقة قبل بدء جلسة جديدة.' };
  return { route: { name: 'book-progress', bookId: book.id }, reason: 'book-progress', messageAr: 'راجع تقدم الكتاب واختر الخطوة التالية.' };
}
