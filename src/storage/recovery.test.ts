import { describe, expect, it } from 'vitest';
import { findRecoveryCandidate } from './recovery';
import type { Session } from '../domain/sessions/session';

const session: Session = { schemaVersion: 1, id: 's1', planId: 'p1', status: 'interrupted', currentStepId: 'read', lastSafeStatus: 'active', updatedAt: '2026-09-14T00:00:00.000Z' };

describe('session recovery', () => {
  it('returns the latest safe state', () => expect(findRecoveryCandidate(session)).toMatchObject({ safeStatus: 'active' }));
  it('does not recover terminal sessions', () => expect(findRecoveryCandidate({ ...session, status: 'completed' })).toBeNull());
});
