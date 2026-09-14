export type TimerMode = 'pomodoro' | 'focus-50-10' | 'short-block' | 'timeboxing';

export interface TimerState {
  readonly mode: TimerMode;
  readonly status: 'idle' | 'running' | 'paused' | 'break' | 'expired';
  readonly startedAt?: string;
  readonly targetEndAt?: string;
  readonly pausedAt?: string;
  readonly accumulatedPausedMs: number;
  readonly breakStartedAt?: string;
  readonly breakEndAt?: string;
}

export function startTimer(mode: TimerMode, now: string, durationMinutes: number): TimerState {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Timer duration must be positive.');
  const end = new Date(now).getTime() + durationMinutes * 60_000;
  if (!Number.isFinite(end)) throw new Error('Timer start time is invalid.');
  return { mode, status: 'running', startedAt: now, targetEndAt: new Date(end).toISOString(), accumulatedPausedMs: 0 };
}

export function remainingTimerMs(state: TimerState, now: string): number {
  if (!state.targetEndAt || state.status === 'idle') return 0;
  if (state.status === 'paused' && state.pausedAt) return Math.max(0, new Date(state.targetEndAt).getTime() - new Date(state.pausedAt).getTime());
  return Math.max(0, new Date(state.targetEndAt).getTime() - new Date(now).getTime());
}

export function pauseTimer(state: TimerState, now: string): TimerState {
  if (state.status !== 'running') throw new Error('Timer is not running.');
  return { ...state, status: 'paused', pausedAt: now };
}

export function resumeTimer(state: TimerState, now: string): TimerState {
  if (state.status !== 'paused' || !state.pausedAt || !state.targetEndAt) throw new Error('Timer is not paused.');
  const pausedMs = Math.max(0, new Date(now).getTime() - new Date(state.pausedAt).getTime());
  const end = new Date(state.targetEndAt).getTime() + pausedMs;
  return { ...state, status: 'running', targetEndAt: new Date(end).toISOString(), accumulatedPausedMs: state.accumulatedPausedMs + pausedMs, pausedAt: undefined };
}

export function startBreak(state: TimerState, now: string, durationMinutes: number): TimerState {
  if (state.status !== 'running' && state.status !== 'paused') throw new Error('Break is unavailable.');
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Break duration must be positive.');
  const end = new Date(now).getTime() + durationMinutes * 60_000;
  return { ...state, status: 'break', breakStartedAt: now, breakEndAt: new Date(end).toISOString() };
}

export function tickTimer(state: TimerState, now: string): TimerState {
  if (state.status === 'running' && remainingTimerMs(state, now) === 0) return { ...state, status: 'expired' };
  if (state.status === 'break' && state.breakEndAt && new Date(state.breakEndAt).getTime() <= new Date(now).getTime()) return { ...state, status: 'running', breakStartedAt: undefined, breakEndAt: undefined };
  return state;
}
