import type { Book } from '../books/book';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';
import type { DistractionEvent, LearningArtifact } from '../sessions/sessionRecords';
import { isClosedGapArtifact, isGapArtifact } from '../sessions/learningArtifacts';

export const LEARNING_METRICS_VERSION = 1 as const;

export interface LearningMetrics {
  readonly version: typeof LEARNING_METRICS_VERSION;
  readonly bookId: string;
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly completionRate: number;
  readonly recallCount: number;
  readonly openGapCount: number;
  readonly closedGapCount: number;
  readonly applicationCount: number;
  readonly distractionCount: number;
  readonly pagesRead: number;
  readonly pageProgressPercent: number;
  readonly source: Readonly<{ readonly sessions: number; readonly artifacts: number; readonly distractions: number }>;
}

export interface LearningMetricsInput {
  readonly book: Book;
  readonly plans: readonly ReadingPlan[];
  readonly sessions: readonly Session[];
  readonly artifacts: readonly LearningArtifact[];
  readonly distractions?: readonly DistractionEvent[];
}

function clampPercent(value: number): number { return Math.max(0, Math.min(100, Math.round(value * 100) / 100)); }

export function calculateLearningMetrics(input: LearningMetricsInput): LearningMetrics {
  const planIds = new Set(input.plans.filter((plan) => plan.bookId === input.book.id).map((plan) => plan.id));
  const sessions = input.sessions.filter((session) => planIds.has(session.planId));
  const sessionIds = new Set(sessions.map((session) => session.id));
  const artifacts = input.artifacts.filter((artifact) => sessionIds.has(artifact.sessionId));
  const distractions = (input.distractions ?? []).filter((event) => sessionIds.has(event.sessionId));
  const completedSessions = sessions.filter((session) => session.status === 'completed').length;
  const gaps = artifacts.filter(isGapArtifact);
  const pagesRead = sessions.reduce((total, session) => {
    if (typeof session.completedPages === 'number' && Number.isFinite(session.completedPages)) return total + Math.max(0, session.completedPages);
    if (session.status !== 'completed') return total;
    const start = session.pageStart ?? 0;
    const end = session.pageEnd ?? 0;
    return total + Math.max(0, end - start);
  }, 0);
  return {
    version: LEARNING_METRICS_VERSION,
    bookId: input.book.id,
    totalSessions: sessions.length,
    completedSessions,
    completionRate: sessions.length ? clampPercent((completedSessions / sessions.length) * 100) : 0,
    recallCount: artifacts.filter((artifact) => artifact.type === 'recall').length,
    openGapCount: gaps.filter((gap) => !isClosedGapArtifact(gap)).length,
    closedGapCount: gaps.filter(isClosedGapArtifact).length,
    applicationCount: artifacts.filter((artifact) => artifact.type === 'application').length,
    distractionCount: distractions.length,
    pagesRead,
    pageProgressPercent: input.book.metadata.totalPages ? clampPercent((pagesRead / input.book.metadata.totalPages) * 100) : 0,
    source: { sessions: sessions.length, artifacts: artifacts.length, distractions: distractions.length },
  };
}
