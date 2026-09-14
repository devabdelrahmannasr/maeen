import { describe, expect, it, vi } from 'vitest';
import { createAutosaveCoordinator } from './autosave';

describe('autosave coordinator', () => {
  it('coalesces overlapping saves to the latest value', async () => {
    let release: (() => void) | undefined;
    const commit = vi.fn((value: string) => new Promise<void>((resolve) => {
      if (value === 'first') release = resolve;
      else resolve();
    }));
    const coordinator = createAutosaveCoordinator(commit);
    const first = coordinator.save('first');
    await expect(coordinator.save('latest')).resolves.toEqual({ status: 'pending' });
    release?.();
    await expect(first).resolves.toEqual({ status: 'saved' });
    expect(commit.mock.calls.map(([value]) => value)).toEqual(['first', 'latest']);
  });

  it('reports retryable failure and retries the last failed value', async () => {
    let attempts = 0;
    const commit = vi.fn(async (value: string) => { attempts += 1; if (attempts === 1) throw new Error(`failed:${value}`); });
    const coordinator = createAutosaveCoordinator(commit);
    await expect(coordinator.save('draft')).resolves.toEqual({ status: 'retryable', error: 'failed:draft' });
    await expect(coordinator.retry()).resolves.toEqual({ status: 'saved' });
    expect(commit).toHaveBeenCalledTimes(2);
  });
});
