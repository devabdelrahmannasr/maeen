import { describe, expect, it } from 'vitest';
import { recommendBookResume } from './resumeRecommendation';
import type { Book } from '../books/book';
import type { ReadingPlan } from '../planning/readingPlan';
import type { Session } from '../sessions/session';

const book: Book = { schemaVersion: 1, id: 'book-1', metadata: { title: 'Book', totalPages: 10 }, fingerprint: 'fp', createdAt: '2026-09-15T00:00:00.000Z', updatedAt: '2026-09-15T00:00:00.000Z' };
const plan: ReadingPlan = { schemaVersion: 1, id: 'plan-1', bookId: book.id, startPage: 0, endPage: 10, primaryGoal: 'deep-understanding', secondaryGoals: [], availableMinutes: 30, dailyPageTarget: 5, protocolSnapshotId: 'snapshot', status: 'active', createdAt: book.createdAt, updatedAt: book.updatedAt };
const session: Session = { schemaVersion: 1, id: 'session-1', planId: plan.id, status: 'interrupted', currentStepId: 'focus', lastSafeStatus: 'active', updatedAt: '2026-09-15T01:00:00.000Z' };

describe('resume recommendations', () => {
  it('prefers interrupted safe sessions and excludes abandoned sessions', () => {
    expect(recommendBookResume(book, plan, [session])).toMatchObject({ reason: 'interrupted-session', route: { name: 'focus-session', sessionId: session.id } });
    expect(recommendBookResume(book, plan, [{ ...session, status: 'abandoned' }])).toMatchObject({ reason: 'active-plan', route: { name: 'protocol-preview' } });
  });
});
