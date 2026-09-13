import { describe, expect, it } from 'vitest';
import { getLastSafeRoute, LAST_SAFE_ROUTE_KEY, setLastSafeRoute } from './navigationSettings';

describe('navigation settings', () => {
  it('stores and restores a serialized safe route', async () => {
    await setLastSafeRoute({ name: 'library' });

    expect(window.localStorage.getItem(LAST_SAFE_ROUTE_KEY)).toBe('#/library');
    await expect(getLastSafeRoute()).resolves.toEqual({ name: 'library' });
  });

  it.each(['not-a-route', '#/settings', '#/books/book-1/goals'])('rejects unsafe stored content: %s', async (storedRoute) => {
    window.localStorage.setItem(LAST_SAFE_ROUTE_KEY, storedRoute);

    await expect(getLastSafeRoute()).resolves.toBeNull();
  });

  it('does not persist a route that is not safely restorable', async () => {
    await setLastSafeRoute({ name: 'settings-data' });

    expect(window.localStorage.getItem(LAST_SAFE_ROUTE_KEY)).toBeNull();
  });
});
