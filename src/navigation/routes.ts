export const APP_ROUTE_NAMES = [
  'onboarding',
  'library',
  'new-book',
  'goal-selection',
  'protocol-preview',
  'focus-session',
  'recall-review',
  'session-summary',
  'book-progress',
  'settings-data',
] as const;

export type AppRouteName = (typeof APP_ROUTE_NAMES)[number];

export type AppRoute =
  | { name: 'onboarding' }
  | { name: 'library' }
  | { name: 'new-book' }
  | { name: 'goal-selection'; bookId: string }
  | { name: 'protocol-preview'; planId: string }
  | { name: 'focus-session'; sessionId: string }
  | { name: 'recall-review'; sessionId: string }
  | { name: 'session-summary'; sessionId: string }
  | { name: 'book-progress'; bookId: string }
  | { name: 'settings-data' };

type RouteParameterName = 'bookId' | 'planId' | 'sessionId';

export interface RouteDescriptor {
  name: AppRouteName;
  path: string;
  enabled: boolean;
  safelyRestorable: boolean;
  requiredParameters: readonly RouteParameterName[];
}

export const ROUTE_CATALOG: readonly RouteDescriptor[] = [
  { name: 'onboarding', path: '#/onboarding', enabled: true, safelyRestorable: false, requiredParameters: [] },
  { name: 'library', path: '#/library', enabled: true, safelyRestorable: true, requiredParameters: [] },
  { name: 'new-book', path: '#/books/new', enabled: false, safelyRestorable: false, requiredParameters: [] },
  { name: 'goal-selection', path: '#/books/:bookId/goals', enabled: false, safelyRestorable: false, requiredParameters: ['bookId'] },
  { name: 'protocol-preview', path: '#/plans/:planId/protocol', enabled: false, safelyRestorable: false, requiredParameters: ['planId'] },
  { name: 'focus-session', path: '#/sessions/:sessionId/focus', enabled: false, safelyRestorable: false, requiredParameters: ['sessionId'] },
  { name: 'recall-review', path: '#/sessions/:sessionId/review', enabled: false, safelyRestorable: false, requiredParameters: ['sessionId'] },
  { name: 'session-summary', path: '#/sessions/:sessionId/summary', enabled: false, safelyRestorable: false, requiredParameters: ['sessionId'] },
  { name: 'book-progress', path: '#/books/:bookId/progress', enabled: false, safelyRestorable: false, requiredParameters: ['bookId'] },
  { name: 'settings-data', path: '#/settings', enabled: false, safelyRestorable: false, requiredParameters: [] },
] as const;

const MAX_ROUTE_IDENTIFIER_LENGTH = 128;
const routeNames = new Set<string>(APP_ROUTE_NAMES);

function decodeRouteIdentifier(encodedIdentifier: string): string | null {
  try {
    const identifier = decodeURIComponent(encodedIdentifier);

    if (
      identifier.length === 0
      || identifier.length > MAX_ROUTE_IDENTIFIER_LENGTH
      || identifier.trim() !== identifier
      || /[\u0000-\u001f\u007f/]/u.test(identifier)
    ) {
      return null;
    }

    return identifier;
  } catch {
    return null;
  }
}

function isValidRouteIdentifier(identifier: unknown): identifier is string {
  return typeof identifier === 'string'
    && identifier.length > 0
    && identifier.length <= MAX_ROUTE_IDENTIFIER_LENGTH
    && identifier.trim() === identifier
    && !/[\u0000-\u001f\u007f/]/u.test(identifier);
}

export function isKnownRoute(route: unknown): route is AppRoute {
  if (typeof route !== 'object' || route === null || !('name' in route)) {
    return false;
  }

  if (typeof route.name !== 'string' || !routeNames.has(route.name)) {
    return false;
  }

  switch (route.name) {
    case 'goal-selection':
    case 'book-progress': return 'bookId' in route && isValidRouteIdentifier(route.bookId);
    case 'protocol-preview': return 'planId' in route && isValidRouteIdentifier(route.planId);
    case 'focus-session':
    case 'recall-review':
    case 'session-summary': return 'sessionId' in route && isValidRouteIdentifier(route.sessionId);
    default: return true;
  }
}

export function isEnabledRoute(route: AppRoute): boolean {
  return ROUTE_CATALOG.some((descriptor) => descriptor.name === route.name && descriptor.enabled);
}

export function isSafelyRestorableRoute(route: AppRoute): boolean {
  return ROUTE_CATALOG.some(
    (descriptor) => descriptor.name === route.name && descriptor.enabled && descriptor.safelyRestorable,
  );
}

export function parseRouteHash(routeHash: string): AppRoute | null {
  const path = routeHash.startsWith('#') ? routeHash.slice(1) : routeHash;

  switch (path) {
    case '/onboarding': return { name: 'onboarding' };
    case '/library': return { name: 'library' };
    case '/books/new': return { name: 'new-book' };
    case '/settings': return { name: 'settings-data' };
  }

  const parameterizedRoutes: ReadonlyArray<{
    pattern: RegExp;
    createRoute: (identifier: string) => AppRoute;
  }> = [
    { pattern: /^\/books\/([^/]+)\/goals$/u, createRoute: (bookId) => ({ name: 'goal-selection', bookId }) },
    { pattern: /^\/plans\/([^/]+)\/protocol$/u, createRoute: (planId) => ({ name: 'protocol-preview', planId }) },
    { pattern: /^\/sessions\/([^/]+)\/focus$/u, createRoute: (sessionId) => ({ name: 'focus-session', sessionId }) },
    { pattern: /^\/sessions\/([^/]+)\/review$/u, createRoute: (sessionId) => ({ name: 'recall-review', sessionId }) },
    { pattern: /^\/sessions\/([^/]+)\/summary$/u, createRoute: (sessionId) => ({ name: 'session-summary', sessionId }) },
    { pattern: /^\/books\/([^/]+)\/progress$/u, createRoute: (bookId) => ({ name: 'book-progress', bookId }) },
  ];

  for (const parameterizedRoute of parameterizedRoutes) {
    const match = parameterizedRoute.pattern.exec(path);
    const encodedIdentifier = match?.[1];

    if (encodedIdentifier) {
      const identifier = decodeRouteIdentifier(encodedIdentifier);
      return identifier ? parameterizedRoute.createRoute(identifier) : null;
    }
  }

  return null;
}

export function serializeRoute(route: AppRoute): string {
  switch (route.name) {
    case 'onboarding': return '#/onboarding';
    case 'library': return '#/library';
    case 'new-book': return '#/books/new';
    case 'goal-selection': return `#/books/${encodeURIComponent(route.bookId)}/goals`;
    case 'protocol-preview': return `#/plans/${encodeURIComponent(route.planId)}/protocol`;
    case 'focus-session': return `#/sessions/${encodeURIComponent(route.sessionId)}/focus`;
    case 'recall-review': return `#/sessions/${encodeURIComponent(route.sessionId)}/review`;
    case 'session-summary': return `#/sessions/${encodeURIComponent(route.sessionId)}/summary`;
    case 'book-progress': return `#/books/${encodeURIComponent(route.bookId)}/progress`;
    case 'settings-data': return '#/settings';
  }
}
