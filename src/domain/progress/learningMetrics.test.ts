import { describe, expect, it } from 'vitest';
import { calculateLearningMetrics } from './learningMetrics';
import type { Book } from '../books/book';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';
import { createLearningArtifact } from '../sessions/learningArtifacts';

const book: Book = { schemaVersion: 1, id: 'book-1', metadata: { title: 'Book', totalPages: 100 }, fingerprint: 'fp', createdAt: '2026-09-15T00:00:00.000Z', updatedAt: '2026-09-15T00:00:00.000Z' };
const plan: ReadingPlan = { schemaVersion: 1, id: 'plan-1', bookId: book.id, startPage: 0, endPage: 100, primaryGoal: 'deep-understanding', secondaryGoals: [], availableMinutes: 30, dailyPageTarget: 10, protocolSnapshotId: 'snapshot', status: 'active', createdAt: book.createdAt, updatedAt: book.updatedAt };

describe('learning metrics', () => {
  it('counts completed sessions and learning evidence deterministically', () => {
    const completed: Session = { schemaVersion: 1, id: 'session-1', planId: plan.id, status: 'completed', currentStepId: 'summary', lastSafeStatus: 'review', pageStart: 0, pageEnd: 20, updatedAt: '2026-09-15T01:00:00.000Z' };
    const abandoned: Session = { ...completed, id: 'session-2', status: 'abandoned' };
    const artifacts = [
      createLearningArtifact({ id: 'recall', sessionId: completed.id, type: 'recall', content: 'recall', createdAt: completed.updatedAt }),
      createLearningArtifact({ id: 'gap', sessionId: completed.id, type: 'review', content: 'gap', createdAt: completed.updatedAt, metadata: { kind: 'gap' } }),
      createLearningArtifact({ id: 'application', sessionId: completed.id, type: 'application', content: 'apply', createdAt: completed.updatedAt }),
    ];
    const result = calculateLearningMetrics({ book, plans: [plan], sessions: [completed, abandoned], artifacts, distractions: [] });
    expect(result).toMatchObject({ totalSessions: 2, completedSessions: 1, completionRate: 50, recallCount: 1, openGapCount: 1, applicationCount: 1, pagesRead: 20, pageProgressPercent: 20 });
    expect(calculateLearningMetrics({ book, plans: [plan], sessions: [completed, abandoned], artifacts, distractions: [] })).toEqual(result);
  });
});
