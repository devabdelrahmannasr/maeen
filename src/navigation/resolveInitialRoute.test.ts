import { describe, expect, it } from 'vitest';
import { resolveInitialRoute } from './resolveInitialRoute';

describe('resolveInitialRoute', () => {
  it('always opens onboarding when onboarding is incomplete', () => {
    expect(resolveInitialRoute({
      onboardingComplete: false,
      currentHash: '#/library',
      persistedRoute: { name: 'library' },
    })).toEqual({ route: { name: 'onboarding' } });
  });

  it('prefers a valid enabled hash for a returning reader', () => {
    expect(resolveInitialRoute({
      onboardingComplete: true,
      currentHash: '#/library',
      persistedRoute: null,
    })).toEqual({ route: { name: 'library' } });
  });

  it('restores a saved safe route when the hash is absent', () => {
    expect(resolveInitialRoute({
      onboardingComplete: true,
      currentHash: '',
      persistedRoute: { name: 'library' },
    })).toEqual({ route: { name: 'library' } });
  });

  it('falls back safely when the hash is unknown', () => {
    expect(resolveInitialRoute({
      onboardingComplete: true,
      currentHash: '#/missing',
      persistedRoute: null,
    })).toEqual({ route: { name: 'library' }, recoveryReason: 'invalid-hash' });
  });

  it.each([
    { name: 'settings-data' as const },
    { name: 'goal-selection' as const, bookId: 'book-1' },
  ])('does not restore a disabled or contextual $name route', (persistedRoute) => {
    expect(resolveInitialRoute({
      onboardingComplete: true,
      currentHash: '',
      persistedRoute,
    })).toEqual({ route: { name: 'library' }, recoveryReason: 'unsafe-saved-route' });
  });
});
