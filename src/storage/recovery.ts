import type { Session } from '../domain/sessions/session';

export interface RecoveryCandidate {
  readonly session: Session;
  readonly safeStatus: Session['lastSafeStatus'];
  readonly messageAr: string;
}

export function findRecoveryCandidate(session: Session | null): RecoveryCandidate | null {
  if (!session || ['completed', 'abandoned'].includes(session.status)) return null;
  const safeStatus = session.status === 'interrupted' ? session.lastSafeStatus : session.status as Session['lastSafeStatus'];
  return { session, safeStatus, messageAr: 'لديك جلسة محفوظة بأمان. يمكنك استكمالها أو تركها دون فقدان ملاحظاتك.' };
}
