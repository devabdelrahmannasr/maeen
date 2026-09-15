import { describe, expect, it } from 'vitest';
import { createGapArtifact, createLearningArtifact, isClosedGapArtifact, resolveGapArtifact, validateLearningArtifact } from './learningArtifacts';

describe('learning artifacts', () => {
  it('normalizes and validates all five artifact types', () => {
    for (const type of ['recall', 'explanation', 'question', 'review', 'application'] as const) {
      expect(createLearningArtifact({ id: type, sessionId: 'session-1', type, content: '  user-authored  ', createdAt: '2026-09-15T00:00:00.000Z' })).toMatchObject({ type, content: 'user-authored', schemaVersion: 1 });
    }
  });

  it('rejects empty or invalid input without mutating the source', () => {
    const input = { id: 'a', sessionId: 's', type: 'recall' as const, content: '  ', createdAt: '2026-09-15T00:00:00.000Z' };
    const before = JSON.stringify(input);
    expect(validateLearningArtifact(input)).toBe('empty-content');
    expect(() => createLearningArtifact(input)).toThrow();
    expect(JSON.stringify(input)).toBe(before);
  });

  it('identifies open and resolved gap artifacts', () => {
    const open = createGapArtifact({ id: 'gap', sessionId: 's', content: 'gap', createdAt: '2026-09-15T00:00:00.000Z' });
    const closed = resolveGapArtifact(open, 'evidence', '2026-09-15T01:00:00.000Z');
    expect(isClosedGapArtifact(open)).toBe(false);
    expect(isClosedGapArtifact(closed)).toBe(true);
    expect(closed.metadata?.sourceArtifactId).toBe('evidence');
  });
});
