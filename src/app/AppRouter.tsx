import type { AppRoute } from '../navigation/routes';
import { LibraryScreen } from '../screens/LibraryScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

interface AppRouterProps {
  route: AppRoute;
  onCompleteOnboarding: () => Promise<void>;
}

export function AppRouter({ route, onCompleteOnboarding }: AppRouterProps) {
  switch (route.name) {
    case 'onboarding':
      return <OnboardingScreen onStart={onCompleteOnboarding} />;
    case 'library':
      return <LibraryScreen />;
    default:
      return null;
  }
}
