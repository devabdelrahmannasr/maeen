export type AutosaveStatus = 'saved' | 'pending' | 'failed' | 'retryable';

export interface AutosaveResult { readonly status: AutosaveStatus; readonly error?: string; }

export interface AutosaveCoordinator<T> {
  save(value: T): Promise<AutosaveResult>;
  retry(): Promise<AutosaveResult>;
}

export function createAutosaveCoordinator<T>(commit: (value: T) => Promise<void>): AutosaveCoordinator<T> {
  let pending: Promise<AutosaveResult> | null = null;
  let queued: T | null = null;
  let lastFailed: T | null = null;
  async function run(value: T): Promise<AutosaveResult> {
    try {
      await commit(value);
      lastFailed = null;
      return { status: 'saved' };
    } catch (error: unknown) {
      lastFailed = value;
      return { status: 'retryable', error: error instanceof Error ? error.message : 'save-failed' };
    }
  }
  async function drain(): Promise<AutosaveResult> {
    const value = queued;
    queued = null;
    if (value === null) return { status: 'saved' };
    return run(value);
  }
  async function save(value: T): Promise<AutosaveResult> {
      if (pending) {
        queued = value;
        return { status: 'pending' };
      }
      pending = run(value);
      try {
        const result = await pending;
        if (queued !== null) {
          pending = drain();
          await pending;
        }
        return result;
      } finally { pending = null; }
  }
  async function retry(): Promise<AutosaveResult> {
      if (lastFailed === null) return { status: 'failed', error: 'nothing-to-retry' };
      return save(lastFailed);
  }
  return { save, retry };
}
