import { describe, expect, it } from 'vitest';
import { decideProtocol, protocolForGoal } from './protocolDecision';
import { GOAL_CATALOG } from '../goals/goalCatalog';

describe('decideProtocol', () => {
  it('maps every primary goal deterministically', () => {
    for (const goal of GOAL_CATALOG) {
      const first = decideProtocol({ primaryGoal: goal.id });
      const second = decideProtocol({ primaryGoal: goal.id });
      expect(first).toEqual(second);
      expect(first.ok).toBe(true);
    }
  });

  it('accepts at most two unique secondary goals', () => {
    expect(decideProtocol({ primaryGoal: 'exam-study', secondaryGoals: ['focus-improvement', 'key-ideas'] }).ok).toBe(true);
    expect(decideProtocol({ primaryGoal: 'exam-study', secondaryGoals: ['focus-improvement', 'key-ideas', 'critical-reading'] })).toMatchObject({ ok: false, error: { code: 'too-many-secondary-goals' } });
    expect(decideProtocol({ primaryGoal: 'exam-study', secondaryGoals: ['focus-improvement', 'focus-improvement'] })).toMatchObject({ ok: false, error: { code: 'duplicate-secondary-goal' } });
  });

  it('rejects invalid goals and primary conflicts', () => {
    expect(decideProtocol({ primaryGoal: null })).toMatchObject({ ok: false, error: { code: 'missing-primary' } });
    expect(decideProtocol({ primaryGoal: 'not-a-goal' })).toMatchObject({ ok: false, error: { code: 'unknown-goal' } });
    expect(decideProtocol({ primaryGoal: 'exam-study', secondaryGoals: ['exam-study'] })).toMatchObject({ ok: false, error: { code: 'primary-as-secondary' } });
  });

  it('does not mutate caller input', () => {
    const secondaryGoals = ['focus-improvement', 'key-ideas'] as const;
    const input = { primaryGoal: 'exam-study' as const, secondaryGoals };
    decideProtocol(input);
    expect(input).toEqual({ primaryGoal: 'exam-study', secondaryGoals });
  });

  it('exposes the stable primary mapping', () => {
    expect(protocolForGoal('focus-improvement')).toBe('focus-recovery');
  });
});
