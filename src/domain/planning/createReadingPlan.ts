import type { GoalSelectionInput } from '../rules/protocolDecision';
import { decideProtocol } from '../rules/protocolDecision';
import { createProtocolSnapshot, type ProtocolSnapshot } from '../protocols/protocolSnapshot';
import { calculateReadingTime } from './readingTime';
import type { ReadingPlan } from './readingPlan';
import type { ReadingPlanRepository } from './readingPlanRepository';

export interface ReadingPlanDependencies {
  readonly repository: ReadingPlanRepository;
  readonly saveSnapshot: (snapshot: ProtocolSnapshot) => Promise<void>;
  readonly savePlanAndSnapshot?: (plan: ReadingPlan, snapshot: ProtocolSnapshot) => Promise<void>;
  readonly createId: () => string;
  readonly now: () => string;
}

export interface CreateReadingPlanInput extends GoalSelectionInput {
  readonly bookId: string;
  readonly startPage: number;
  readonly endPage: number;
  readonly availableMinutes: number;
  readonly today: string;
  readonly deadline?: string;
}

export async function createReadingPlan(input: CreateReadingPlanInput, dependencies: ReadingPlanDependencies): Promise<{ readonly plan: ReadingPlan; readonly snapshot: ProtocolSnapshot }> {
  const decision = decideProtocol(input);
  if (!decision.ok) throw new Error(decision.error.messageAr);
  if (!input.bookId || !Number.isInteger(input.startPage) || !Number.isInteger(input.endPage) || input.startPage < 0 || input.endPage <= input.startPage) throw new Error('Invalid reading page range.');
  const time = calculateReadingTime({ totalPages: input.endPage, currentPage: input.startPage, availableMinutes: input.availableMinutes, today: input.today, deadline: input.deadline });
  const now = dependencies.now();
  const snapshot = createProtocolSnapshot(decision.decision, { id: dependencies.createId(), createdAt: now });
  const plan: ReadingPlan = { schemaVersion: 1, id: dependencies.createId(), bookId: input.bookId, startPage: input.startPage, endPage: input.endPage, primaryGoal: decision.decision.primaryGoal, secondaryGoals: decision.decision.secondaryGoals, availableMinutes: input.availableMinutes, ...(input.deadline ? { deadline: input.deadline } : {}), dailyPageTarget: time.dailyPageTarget, protocolSnapshotId: snapshot.id, status: 'active', createdAt: now, updatedAt: now };
  if (dependencies.savePlanAndSnapshot) {
    await dependencies.savePlanAndSnapshot(plan, snapshot);
  } else {
    await dependencies.saveSnapshot(snapshot);
    await dependencies.repository.save(plan);
  }
  return { plan, snapshot };
}
