import type { AppRoute } from '../navigation/routes';
import { LibraryScreen } from '../screens/LibraryScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { BookProgressScreen, FocusSessionScreen, GoalSelectionScreen, NewBookScreen, ProtocolPreviewScreen, RecallReviewScreen, SessionSummaryScreen } from '../screens/FlowScreens';

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
    case 'new-book':
      return <NewBookScreen />;
    case 'goal-selection':
      return <GoalSelectionScreen route={route} />;
    case 'protocol-preview':
      return <ProtocolPreviewScreen route={route} />;
    case 'focus-session':
      return <FocusSessionScreen route={route} />;
    case 'recall-review':
      return <RecallReviewScreen route={route} />;
    case 'session-summary':
      return <SessionSummaryScreen route={route} />;
    case 'book-progress':
      return <BookProgressScreen route={route} />;
    default:
      return null;
  }
}
