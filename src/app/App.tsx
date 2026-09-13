import { useEffect, useRef, useState } from 'preact/hooks';
import { isEnabledRoute, isSafelyRestorableRoute, serializeRoute, type AppRoute } from '../navigation/routes';
import { resolveInitialRoute, type RouteRecoveryReason } from '../navigation/resolveInitialRoute';
import { getLastSafeRoute, setLastSafeRoute } from '../settings/navigationSettings';
import { getOnboardingComplete, setOnboardingComplete } from '../settings/onboardingSettings';
import { AppRouter } from './AppRouter';
import { AppShell } from './AppShell';

const recoveryMessages: Record<RouteRecoveryReason, string> = {
  'invalid-hash': 'تعذر فتح الوجهة المطلوبة. أعدناك إلى آخر شاشة آمنة.',
  'unsafe-saved-route': 'آخر شاشة محفوظة لم تعد متاحة. فتحنا المكتبة بأمان.',
};

const restorationReadFailureMessage = 'تعذر استعادة آخر شاشة محفوظة. فتحنا المكتبة بأمان.';
const restorationWriteFailureMessage = 'تم فتح الشاشة، لكن تعذر حفظها للاستعادة لاحقًا.';

export function App() {
  const [route, setRoute] = useState<AppRoute | null>(null);
  const [routeStatusMessage, setRouteStatusMessage] = useState<string | null>(null);
  const onboardingCompleteRef = useRef(false);

  function synchronizeHash(nextRoute: AppRoute) {
    const serializedRoute = serializeRoute(nextRoute);

    if (window.location.hash !== serializedRoute) {
      window.history.replaceState(null, '', serializedRoute);
    }
  }

  async function navigate(nextRoute: AppRoute) {
    const destination = isEnabledRoute(nextRoute) ? nextRoute : { name: 'library' as const };

    setRoute(destination);
    setRouteStatusMessage(isEnabledRoute(nextRoute) ? null : recoveryMessages['invalid-hash']);
    synchronizeHash(destination);

    if (isSafelyRestorableRoute(destination)) {
      try {
        await setLastSafeRoute(destination);
      } catch {
        setRouteStatusMessage(restorationWriteFailureMessage);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;
    let removeHashListener = () => {};

    async function startApplication() {
      let onboardingComplete = false;

      try {
        onboardingComplete = await getOnboardingComplete();
      } catch {
        onboardingComplete = false;
      }

      onboardingCompleteRef.current = onboardingComplete;
      let persistedRoute: AppRoute | null = null;
      let storageReadFailed = false;

      if (onboardingComplete) {
        try {
          persistedRoute = await getLastSafeRoute();
        } catch {
          storageReadFailed = true;
        }
      }

      if (!isMounted) {
        return;
      }

      const resolution = resolveInitialRoute({
        onboardingComplete,
        currentHash: window.location.hash,
        persistedRoute,
      });

      setRoute(resolution.route);
      synchronizeHash(resolution.route);
      setRouteStatusMessage(
        storageReadFailed
          ? restorationReadFailureMessage
          : resolution.recoveryReason
            ? recoveryMessages[resolution.recoveryReason]
            : null,
      );

      const handleHashChange = () => {
        const hashResolution = resolveInitialRoute({
          onboardingComplete: onboardingCompleteRef.current,
          currentHash: window.location.hash,
          persistedRoute: null,
        });

        void navigate(hashResolution.route);
        if (hashResolution.recoveryReason) {
          setRouteStatusMessage(recoveryMessages[hashResolution.recoveryReason]);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      removeHashListener = () => window.removeEventListener('hashchange', handleHashChange);
    }

    void startApplication();

    return () => {
      isMounted = false;
      removeHashListener();
    };
  }, []);

  async function completeOnboarding() {
    await setOnboardingComplete(true);
    onboardingCompleteRef.current = true;
    await navigate({ name: 'library' });
  }

  return (
    <AppShell isLoading={route === null} statusMessage={routeStatusMessage}>
      {route ? <AppRouter route={route} onCompleteOnboarding={completeOnboarding} /> : null}
    </AppShell>
  );
}
