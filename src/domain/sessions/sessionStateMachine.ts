import type { Session, SessionStatus } from './session';

export type SessionCommand =
  | 'prepare' | 'start' | 'pause' | 'resume' | 'start-break' | 'finish-break'
  | 'to-recall' | 'to-review' | 'complete' | 'interrupt' | 'recover' | 'abandon';

export type SessionErrorCode = 'invalid-transition' | 'missing-recovery-state';

export interface SessionTransitionError {
  readonly code: SessionErrorCode;
  readonly messageAr: string;
}

export type SessionTransitionResult =
  | { readonly ok: true; readonly session: Session }
  | { readonly ok: false; readonly error: SessionTransitionError };

const transitions: Readonly<Record<SessionCommand, Readonly<Record<SessionStatus, SessionStatus | undefined>>>> = {
  prepare: { draft: 'ready', ready: undefined, active: undefined, paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  start: { draft: undefined, ready: 'active', active: undefined, paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  pause: { draft: undefined, ready: undefined, active: 'paused', paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  resume: { draft: undefined, ready: undefined, active: undefined, paused: 'active', break: 'active', recall: undefined, review: undefined, completed: undefined, interrupted: 'active', abandoned: undefined },
  'start-break': { draft: undefined, ready: undefined, active: 'break', paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  'finish-break': { draft: undefined, ready: undefined, active: undefined, paused: undefined, break: 'active', recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  'to-recall': { draft: undefined, ready: undefined, active: 'recall', paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  'to-review': { draft: undefined, ready: undefined, active: undefined, paused: undefined, break: undefined, recall: 'review', review: undefined, completed: undefined, interrupted: undefined, abandoned: undefined },
  complete: { draft: undefined, ready: undefined, active: undefined, paused: undefined, break: undefined, recall: undefined, review: 'completed', completed: undefined, interrupted: undefined, abandoned: undefined },
  interrupt: { draft: undefined, ready: undefined, active: 'interrupted', paused: 'interrupted', break: 'interrupted', recall: 'interrupted', review: 'interrupted', completed: undefined, interrupted: undefined, abandoned: undefined },
  recover: { draft: undefined, ready: undefined, active: undefined, paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: 'active', abandoned: undefined },
  abandon: { draft: 'abandoned', ready: undefined, active: 'abandoned', paused: undefined, break: undefined, recall: undefined, review: undefined, completed: undefined, interrupted: 'abandoned', abandoned: undefined },
};

export function transitionSession(session: Session, command: SessionCommand, now: string): SessionTransitionResult {
  const nextStatus = transitions[command][session.status];
  if (!nextStatus) {
    return { ok: false, error: { code: command === 'recover' ? 'missing-recovery-state' : 'invalid-transition', messageAr: command === 'recover' ? 'لا توجد جلسة آمنة لاستعادتها.' : 'لا يمكن تنفيذ هذه الخطوة من حالة الجلسة الحالية.' } };
  }

  const safeStatus = nextStatus === 'interrupted'
    ? session.status as Session['lastSafeStatus']
    : nextStatus === 'abandoned'
      ? session.lastSafeStatus
      : nextStatus as Session['lastSafeStatus'];
  const next: Session = {
    ...session,
    status: nextStatus,
    lastSafeStatus: nextStatus === 'interrupted' ? session.status as Session['lastSafeStatus'] : safeStatus,
    updatedAt: now,
    ...(command === 'start' ? { startedAt: now } : {}),
    ...(command === 'pause' ? { pausedAt: now } : {}),
    ...(command === 'complete' ? { completedAt: now } : {}),
    ...(command === 'abandon' ? { abandonedAt: now } : {}),
  };
  return { ok: true, session: next };
}
