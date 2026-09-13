import {
  mergeUserSettings,
  normalizeUserSettings,
  type UserSettingsPatch,
  type UserSettingsV1,
} from './userSettings';

export const USER_SETTINGS_KEY = 'userSettings.v1';

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

export async function getUserSettings(): Promise<UserSettingsV1> {
  if (hasChromeStorage()) {
    const storedSettings = await chrome.storage.local.get(USER_SETTINGS_KEY);
    return normalizeUserSettings(storedSettings[USER_SETTINGS_KEY]);
  }

  const serializedSettings = window.localStorage.getItem(USER_SETTINGS_KEY);

  if (serializedSettings === null) {
    return normalizeUserSettings(undefined);
  }

  try {
    return normalizeUserSettings(JSON.parse(serializedSettings));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return normalizeUserSettings(undefined);
    }

    throw error;
  }
}

export async function updateUserSettings(patch: UserSettingsPatch): Promise<UserSettingsV1> {
  const currentSettings = await getUserSettings();
  const nextSettings = mergeUserSettings(currentSettings, patch);

  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [USER_SETTINGS_KEY]: nextSettings });
  } else {
    window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(nextSettings));
  }

  return nextSettings;
}
