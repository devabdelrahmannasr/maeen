import { useEffect, useState } from 'preact/hooks';
import { getOnboardingComplete, setOnboardingComplete } from '../settings/onboardingSettings';
import { LibraryScreen } from '../screens/LibraryScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

type AppRoute = 'onboarding' | 'library';

export function App() {
  const [route, setRoute] = useState<AppRoute | null>(null);

  useEffect(() => {
    let isMounted = true;

    getOnboardingComplete().then((isComplete) => {
      if (isMounted) {
        setRoute(isComplete ? 'library' : 'onboarding');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function completeOnboarding() {
    await setOnboardingComplete(true);
    setRoute('library');
  }

  if (route === null) {
    return (
      <main class="app-shell app-shell--centered" aria-busy="true" aria-label="جارٍ تحميل مرافق القراءة">
        <span class="loading-mark" aria-hidden="true" />
        <p class="supporting-text">نستعيد مساحتك المحلية…</p>
      </main>
    );
  }

  if (route === 'onboarding') {
    return <OnboardingScreen onStart={completeOnboarding} />;
  }

  return <LibraryScreen />;
}
