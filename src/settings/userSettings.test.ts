import { describe, expect, it } from 'vitest';
import {
  DEFAULT_USER_SETTINGS,
  mergeUserSettings,
  normalizeUserSettings,
} from './userSettings';

describe('user settings contract', () => {
  it('returns fresh defaults for missing, non-object, and unsupported settings', () => {
    const missingSettings = normalizeUserSettings(undefined);

    expect(missingSettings).toEqual(DEFAULT_USER_SETTINGS);
    expect(missingSettings).not.toBe(DEFAULT_USER_SETTINGS);
    expect(normalizeUserSettings('corrupt')).toEqual(DEFAULT_USER_SETTINGS);
    expect(normalizeUserSettings({ schemaVersion: 2, theme: 'dark' })).toEqual(DEFAULT_USER_SETTINGS);
  });

  it.each(['system', 'light', 'dark'] as const)('keeps the valid %s theme', (theme) => {
    expect(normalizeUserSettings({ ...DEFAULT_USER_SETTINGS, theme }).theme).toBe(theme);
  });

  it('accepts only Arabic as the interface language', () => {
    expect(normalizeUserSettings({ ...DEFAULT_USER_SETTINGS, interfaceLanguage: 'ar' }).interfaceLanguage).toBe('ar');
    expect(normalizeUserSettings({ ...DEFAULT_USER_SETTINGS, interfaceLanguage: 'en' }).interfaceLanguage).toBe('ar');
  });

  it.each([5, 180])('accepts the inclusive duration boundary %i', (duration) => {
    expect(
      normalizeUserSettings({ ...DEFAULT_USER_SETTINGS, defaultSessionDurationMinutes: duration })
        .defaultSessionDurationMinutes,
    ).toBe(duration);
  });

  it.each([4, 181, 30.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'replaces invalid duration %s with the safe default',
    (duration) => {
      expect(
        normalizeUserSettings({ ...DEFAULT_USER_SETTINGS, defaultSessionDurationMinutes: duration })
          .defaultSessionDurationMinutes,
      ).toBe(30);
    },
  );

  it('normalizes fields independently and ignores unknown properties', () => {
    expect(
      normalizeUserSettings({
        schemaVersion: 1,
        interfaceLanguage: 'en',
        theme: 'dark',
        defaultSessionDurationMinutes: 45,
        futureMetadata: true,
      }),
    ).toEqual({
      schemaVersion: 1,
      interfaceLanguage: 'ar',
      theme: 'dark',
      defaultSessionDurationMinutes: 45,
    });
  });

  it('merges a known patch without mutating either input', () => {
    const currentSettings = { ...DEFAULT_USER_SETTINGS, theme: 'light' as const };
    const patch = { theme: 'dark' as const, defaultSessionDurationMinutes: 50 };

    const mergedSettings = mergeUserSettings(currentSettings, patch);

    expect(mergedSettings).toEqual({ ...DEFAULT_USER_SETTINGS, theme: 'dark', defaultSessionDurationMinutes: 50 });
    expect(currentSettings).toEqual({ ...DEFAULT_USER_SETTINGS, theme: 'light' });
    expect(patch).toEqual({ theme: 'dark', defaultSessionDurationMinutes: 50 });
  });
});
