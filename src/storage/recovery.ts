import type { Session } from '../domain/sessions/session';
import { transitionSession } from '../domain/sessions/sessionStateMachine';

export interface RecoveryCandidate {
  readonly session: Session;
  readonly safeStatus: Session['lastSafeStatus'];
  readonly messageAr: string;
}

export interface SessionRecoveryRepository { save(session: Session): Promise<void>; }

export function findRecoveryCandidate(session: Session | null): RecoveryCandidate | null {
  if (!session || ['completed', 'abandoned'].includes(session.status)) return null;
  const safeStatus = session.status === 'interrupted' ? session.lastSafeStatus : session.status as Session['lastSafeStatus'];
  return { session, safeStatus, messageAr: 'لديك جلسة محفوظة بأمان. يمكنك استكمالها أو تركها دون فقدان ملاحظاتك.' };
}

export async function recoverInterruptedSession(candidate: RecoveryCandidate, repository: SessionRecoveryRepository, now: string): Promise<Session> {
  const result = transitionSession(candidate.session, 'recover', now);
  if (!result.ok) throw new Error(result.error.messageAr);
  await repository.save(result.session);
  return result.session;
}

export async function abandonInterruptedSession(candidate: RecoveryCandidate, repository: SessionRecoveryRepository, now: string): Promise<Session> {
  const result = transitionSession(candidate.session, 'abandon', now);
  if (!result.ok) throw new Error(result.error.messageAr);
  await repository.save(result.session);
  return result.session;
}
