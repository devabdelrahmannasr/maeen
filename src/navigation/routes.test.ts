import { describe, expect, it } from 'vitest';
import {
  APP_ROUTE_NAMES,
  ROUTE_CATALOG,
  isKnownRoute,
  isSafelyRestorableRoute,
  parseRouteHash,
  serializeRoute,
  type AppRoute,
} from './routes';

describe('route catalog', () => {
  it('defines ten unique stable names and paths', () => {
    expect(APP_ROUTE_NAMES).toHaveLength(10);
    expect(new Set(ROUTE_CATALOG.map(({ name }) => name)).size).toBe(10);
    expect(new Set(ROUTE_CATALOG.map(({ path }) => path)).size).toBe(10);
    expect(ROUTE_CATALOG.map(({ name }) => name)).toEqual(APP_ROUTE_NAMES);
  });

  it.each<AppRoute>([
    { name: 'onboarding' },
    { name: 'library' },
    { name: 'new-book' },
    { name: 'goal-selection', bookId: 'book-1' },
    { name: 'protocol-preview', planId: 'خطة 1' },
    { name: 'focus-session', sessionId: 'session-1' },
    { name: 'recall-review', sessionId: 'session-2' },
    { name: 'session-summary', sessionId: 'session-3' },
    { name: 'book-progress', bookId: 'book-2' },
    { name: 'settings-data' },
  ])('round-trips $name through serialization and parsing', (route) => {
    expect(parseRouteHash(serializeRoute(route))).toEqual(route);
    expect(isKnownRoute(route)).toBe(true);
  });

  it.each([
    '#/unknown',
    '#/books//goals',
    '#/books/%2F/goals',
    '#/books/%20/goals',
    '#/books/%E0%A4%A/goals',
    `#/books/${'a'.repeat(129)}/goals`,
  ])('rejects an invalid route hash: %s', (routeHash) => {
    expect(parseRouteHash(routeHash)).toBeNull();
  });

  it('rejects a runtime route object with missing or invalid context', () => {
    expect(isKnownRoute({ name: 'goal-selection' })).toBe(false);
    expect(isKnownRoute({ name: 'focus-session', sessionId: ' session ' })).toBe(false);
  });

  it('allows only Library to be safely restored in WORK-018', () => {
    const routes = ROUTE_CATALOG.map(({ name }) => parseRouteHash(serializeRoute(routeForName(name))));
    const safelyRestorableNames = routes
      .filter((route): route is AppRoute => route !== null && isSafelyRestorableRoute(route))
      .map(({ name }) => name);

    expect(safelyRestorableNames).toEqual(['library']);
  });
});

function routeForName(name: AppRoute['name']): AppRoute {
  switch (name) {
    case 'goal-selection': return { name, bookId: 'book' };
    case 'protocol-preview': return { name, planId: 'plan' };
    case 'focus-session':
    case 'recall-review':
    case 'session-summary': return { name, sessionId: 'session' };
    case 'book-progress': return { name, bookId: 'book' };
    default: return { name };
  }
}
