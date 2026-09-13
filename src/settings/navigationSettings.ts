import { isSafelyRestorableRoute, parseRouteHash, serializeRoute, type AppRoute } from '../navigation/routes';

export const LAST_SAFE_ROUTE_KEY = 'navigation.lastSafeRoute.v1';

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

export async function getLastSafeRoute(): Promise<AppRoute | null> {
  const serializedRoute = hasChromeStorage()
    ? (await chrome.storage.local.get(LAST_SAFE_ROUTE_KEY))[LAST_SAFE_ROUTE_KEY]
    : window.localStorage.getItem(LAST_SAFE_ROUTE_KEY);

  if (typeof serializedRoute !== 'string') {
    return null;
  }

  const route = parseRouteHash(serializedRoute);
  return route && isSafelyRestorableRoute(route) ? route : null;
}

export async function setLastSafeRoute(route: AppRoute): Promise<void> {
  if (!isSafelyRestorableRoute(route)) {
    return;
  }

  const serializedRoute = serializeRoute(route);

  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [LAST_SAFE_ROUTE_KEY]: serializedRoute });
    return;
  }

  window.localStorage.setItem(LAST_SAFE_ROUTE_KEY, serializedRoute);
}
