import { describe, expect, it } from 'vitest';
import { decideProtocol } from '../rules/protocolDecision';
import { createProtocolSnapshot } from './protocolSnapshot';

describe('createProtocolSnapshot', () => {
  it('copies a deterministic, frozen snapshot', () => {
    const result = decideProtocol({ primaryGoal: 'exam-study', secondaryGoals: ['focus-improvement'] });
    if (!result.ok) throw new Error('expected valid decision');
    const snapshot = createProtocolSnapshot(result.decision, { id: 'snap-1', createdAt: '2026-09-14T10:00:00.000Z' });
    expect(snapshot.protocolId).toBe('exam-study');
    expect(snapshot.steps.length).toBeGreaterThan(0);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(JSON.stringify(snapshot)).toBe(JSON.stringify(createProtocolSnapshot(result.decision, { id: 'snap-1', createdAt: '2026-09-14T10:00:00.000Z' })));
  });

  it('does not retain mutable catalog arrays', () => {
    const result = decideProtocol({ primaryGoal: 'deep-understanding' });
    if (!result.ok) throw new Error('expected valid decision');
    const snapshot = createProtocolSnapshot(result.decision, { id: 'snap-2', createdAt: '2026-09-14T10:00:00.000Z' });
    expect(() => (snapshot.buildingBlocks as string[]).push('changed')).toThrow();
    expect(snapshot.buildingBlocks).not.toContain('changed');
  });

  it('rejects missing identity', () => {
    const result = decideProtocol({ primaryGoal: 'exam-study' });
    if (!result.ok) throw new Error('expected valid decision');
    expect(() => createProtocolSnapshot(result.decision, { id: '', createdAt: 'now' })).toThrow();
  });
});
