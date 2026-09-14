import type { GoalId } from '../goals/goalCatalog';

export const READING_PLAN_SCHEMA_VERSION = 1 as const;

export type ReadingPlanStatus = 'active' | 'completed' | 'archived';

export interface ReadingPlan {
  readonly schemaVersion: typeof READING_PLAN_SCHEMA_VERSION;
  readonly id: string;
  readonly bookId: string;
  readonly startPage: number;
  readonly endPage: number;
  readonly primaryGoal: GoalId;
  readonly secondaryGoals: readonly GoalId[];
  readonly availableMinutes: number;
  readonly deadline?: string;
  readonly dailyPageTarget: number;
  readonly protocolSnapshotId: string;
  readonly status: ReadingPlanStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
