import { isEnabledRoute, isSafelyRestorableRoute, parseRouteHash, type AppRoute } from './routes';

export type RouteRecoveryReason = 'invalid-hash' | 'unsafe-saved-route';

interface InitialRouteInputs {
  onboardingComplete: boolean;
  currentHash: string;
  persistedRoute: AppRoute | null;
}

export interface InitialRouteResolution {
  route: AppRoute;
  recoveryReason?: RouteRecoveryReason;
}

export function resolveInitialRoute({
  onboardingComplete,
  currentHash,
  persistedRoute,
}: InitialRouteInputs): InitialRouteResolution {
  if (!onboardingComplete) {
    return { route: { name: 'onboarding' } };
  }

  if (currentHash) {
    const hashRoute = parseRouteHash(currentHash);

    if (hashRoute && isEnabledRoute(hashRoute) && hashRoute.name !== 'onboarding') {
      return { route: hashRoute };
    }

    if (persistedRoute && isSafelyRestorableRoute(persistedRoute)) {
      return { route: persistedRoute, recoveryReason: 'invalid-hash' };
    }

    return { route: { name: 'library' }, recoveryReason: 'invalid-hash' };
  }

  if (persistedRoute) {
    if (isSafelyRestorableRoute(persistedRoute)) {
      return { route: persistedRoute };
    }

    return { route: { name: 'library' }, recoveryReason: 'unsafe-saved-route' };
  }

  return { route: { name: 'library' } };
}
