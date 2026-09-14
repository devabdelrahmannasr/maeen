import { describe, expect, it } from 'vitest';
import { abandonInterruptedSession, findRecoveryCandidate, recoverInterruptedSession } from './recovery';
import type { Session } from '../domain/sessions/session';

const session: Session = { schemaVersion: 1, id: 's1', planId: 'p1', status: 'interrupted', currentStepId: 'read', lastSafeStatus: 'active', updatedAt: '2026-09-14T00:00:00.000Z' };

describe('session recovery', () => {
  it('returns the latest safe state', () => expect(findRecoveryCandidate(session)).toMatchObject({ safeStatus: 'active' }));
  it('does not recover terminal sessions', () => expect(findRecoveryCandidate({ ...session, status: 'completed' })).toBeNull());
  it('persists an explicit resume or abandon choice', async () => {
    const candidate = findRecoveryCandidate(session);
    if (!candidate) throw new Error('expected candidate');
    const saved: Session[] = [];
    const repository = { save: async (next: Session) => { saved.push(next); } };
    await expect(recoverInterruptedSession(candidate, repository, '2026-09-14T00:01:00.000Z')).resolves.toMatchObject({ status: 'active' });
    await expect(abandonInterruptedSession(candidate, repository, '2026-09-14T00:02:00.000Z')).resolves.toMatchObject({ status: 'abandoned' });
    expect(saved).toHaveLength(2);
  });
});
