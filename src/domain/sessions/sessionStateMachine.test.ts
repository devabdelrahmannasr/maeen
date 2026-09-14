import { describe, expect, it } from 'vitest';
import { transitionSession } from './sessionStateMachine';
import type { Session } from './session';

const initial: Session = { schemaVersion: 1, id: 'session-1', planId: 'plan-1', status: 'draft', currentStepId: 'preview', lastSafeStatus: 'draft', updatedAt: '2026-09-14T00:00:00.000Z' };

describe('session state machine', () => {
  it('accepts the guided happy path', () => {
    let session = initial;
    for (const command of ['prepare', 'start', 'to-recall', 'to-review', 'complete'] as const) {
      const result = transitionSession(session, command, '2026-09-14T00:01:00.000Z');
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error('expected transition');
      session = result.session;
    }
    expect(session.status).toBe('completed');
  });

  it('rejects invalid transitions without mutation', () => {
    const result = transitionSession(initial, 'pause', '2026-09-14T00:01:00.000Z');
    expect(result).toMatchObject({ ok: false, error: { code: 'invalid-transition' } });
    expect(initial.status).toBe('draft');
  });

  it('recovers interruption and preserves safe status', () => {
    const active = { ...initial, status: 'active' as const, lastSafeStatus: 'active' as const };
    const interrupted = transitionSession(active, 'interrupt', '2026-09-14T00:02:00.000Z');
    if (!interrupted.ok) throw new Error('expected interruption');
    expect(interrupted.session.lastSafeStatus).toBe('active');
    const recovered = transitionSession(interrupted.session, 'recover', '2026-09-14T00:03:00.000Z');
    expect(recovered).toMatchObject({ ok: true, session: { status: 'active' } });
  });
});
