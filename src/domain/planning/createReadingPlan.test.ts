import { describe, expect, it } from 'vitest';
import { createReadingPlan } from './createReadingPlan';
import type { ReadingPlanRepository } from './readingPlanRepository';

describe('createReadingPlan', () => {
  it('links a plan to an immutable snapshot', async () => {
    const plans: unknown[] = [];
    const result = await createReadingPlan({ bookId: 'book-1', startPage: 0, endPage: 100, availableMinutes: 60, today: '2026-09-14', primaryGoal: 'exam-study' }, {
      repository: { get: async () => null, listForBook: async () => [], save: async (plan) => { plans.push(plan); } } satisfies ReadingPlanRepository,
      saveSnapshot: async () => {}, createId: (() => { let count = 0; return () => `id-${++count}`; })(), now: () => '2026-09-14T00:00:00.000Z',
    });
    expect(result.plan.protocolSnapshotId).toBe(result.snapshot.id);
    expect(plans).toHaveLength(1);
  });
});
