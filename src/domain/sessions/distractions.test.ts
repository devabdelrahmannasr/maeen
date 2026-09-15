import { describe, expect, it } from 'vitest';
import { createDistractionEvent } from './distractions';

describe('distraction events', () => {
  it('records a timestamp and step without changing timer concerns', () => {
    expect(createDistractionEvent({ id: 'd1', sessionId: 's1', stepId: 'focus', occurredAt: '2026-09-15T00:00:00.000Z' })).toMatchObject({ schemaVersion: 1, sessionId: 's1', stepId: 'focus', timestamp: '2026-09-15T00:00:00.000Z' });
    expect(() => createDistractionEvent({ id: 'd1', sessionId: 's1', stepId: 'focus', occurredAt: 'bad' })).toThrow();
  });
});
