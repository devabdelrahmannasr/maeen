export const SESSION_SCHEMA_VERSION = 1 as const;

export type SessionStatus = 'draft' | 'ready' | 'active' | 'paused' | 'break' | 'recall' | 'review' | 'completed' | 'interrupted' | 'abandoned';

export interface Session {
  readonly schemaVersion: typeof SESSION_SCHEMA_VERSION;
  readonly id: string;
  readonly planId: string;
  readonly status: SessionStatus;
  readonly currentStepId: string;
  readonly lastSafeStatus: Exclude<SessionStatus, 'interrupted' | 'abandoned' | 'completed'>;
  readonly startedAt?: string;
  readonly targetEndAt?: string;
  readonly pausedAt?: string;
  readonly accumulatedPausedMs?: number;
  readonly breakStartedAt?: string;
  readonly breakEndAt?: string;
  readonly completedAt?: string;
  readonly abandonedAt?: string;
  readonly updatedAt: string;
}
