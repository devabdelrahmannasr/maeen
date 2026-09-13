import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_USER_SETTINGS } from './userSettings';
import { getUserSettings, updateUserSettings, USER_SETTINGS_KEY } from './userSettingsStorage';

describe('user settings storage', () => {
  it('returns safe defaults when storage is empty', async () => {
    await expect(getUserSettings()).resolves.toEqual(DEFAULT_USER_SETTINGS);
  });

  it('persists and restores one normalized settings object', async () => {
    await updateUserSettings({ theme: 'dark', defaultSessionDurationMinutes: 45 });

    expect(JSON.parse(window.localStorage.getItem(USER_SETTINGS_KEY) ?? '')).toEqual({
      ...DEFAULT_USER_SETTINGS,
      theme: 'dark',
      defaultSessionDurationMinutes: 45,
    });
    await expect(getUserSettings()).resolves.toEqual({
      ...DEFAULT_USER_SETTINGS,
      theme: 'dark',
      defaultSessionDurationMinutes: 45,
    });
  });

  it('recovers safely from corrupt JSON and invalid stored fields', async () => {
    window.localStorage.setItem(USER_SETTINGS_KEY, '{bad json');
    await expect(getUserSettings()).resolves.toEqual(DEFAULT_USER_SETTINGS);

    window.localStorage.setItem(
      USER_SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_USER_SETTINGS, theme: 'unknown', defaultSessionDurationMinutes: 60 }),
    );
    await expect(getUserSettings()).resolves.toEqual({
      ...DEFAULT_USER_SETTINGS,
      defaultSessionDurationMinutes: 60,
    });
  });

  it('merges updates with valid stored settings', async () => {
    window.localStorage.setItem(
      USER_SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_USER_SETTINGS, theme: 'light', defaultSessionDurationMinutes: 25 }),
    );

    await updateUserSettings({ defaultSessionDurationMinutes: 50 });

    await expect(getUserSettings()).resolves.toEqual({
      ...DEFAULT_USER_SETTINGS,
      theme: 'light',
      defaultSessionDurationMinutes: 50,
    });
  });

  it('keeps genuine storage read and write failures distinguishable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('read unavailable');
    });
    await expect(getUserSettings()).rejects.toThrow('read unavailable');

    vi.restoreAllMocks();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write unavailable');
    });
    await expect(updateUserSettings({ theme: 'light' })).rejects.toThrow('write unavailable');
  });
});
