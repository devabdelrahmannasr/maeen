import { describe, expect, it } from 'vitest';
import { pauseTimer, remainingTimerMs, resumeTimer, startBreak, startTimer, tickTimer } from './absoluteTimer';

describe('absolute timer', () => {
  it('derives elapsed time from timestamps', () => {
    const started = startTimer('pomodoro', '2026-09-14T00:00:00.000Z', 25);
    expect(remainingTimerMs(started, '2026-09-14T00:10:00.000Z')).toBe(15 * 60_000);
    const paused = pauseTimer(started, '2026-09-14T00:10:00.000Z');
    const resumed = resumeTimer(paused, '2026-09-14T00:20:00.000Z');
    expect(remainingTimerMs(resumed, '2026-09-14T00:20:00.000Z')).toBe(15 * 60_000);
  });

  it('expires after a long suspension', () => {
    const started = startTimer('focus-50-10', '2026-09-14T00:00:00.000Z', 50);
    expect(tickTimer(started, '2026-09-14T01:00:00.000Z').status).toBe('expired');
  });

  it('tracks a break using absolute timestamps', () => {
    const started = startTimer('pomodoro', '2026-09-14T00:00:00.000Z', 25);
    const onBreak = startBreak(started, '2026-09-14T00:05:00.000Z', 5);
    expect(onBreak.status).toBe('break');
    expect(tickTimer(onBreak, '2026-09-14T00:10:00.000Z').status).toBe('running');
  });
});
