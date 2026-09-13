export const USER_SETTINGS_SCHEMA_VERSION = 1 as const;
export const MINIMUM_SESSION_DURATION_MINUTES = 5;
export const MAXIMUM_SESSION_DURATION_MINUTES = 180;

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserSettingsV1 {
  schemaVersion: typeof USER_SETTINGS_SCHEMA_VERSION;
  interfaceLanguage: 'ar';
  theme: ThemePreference;
  defaultSessionDurationMinutes: number;
}

export type UserSettingsPatch = Partial<Pick<UserSettingsV1, 'theme' | 'defaultSessionDurationMinutes'>>;

export const DEFAULT_USER_SETTINGS: Readonly<UserSettingsV1> = Object.freeze({
  schemaVersion: USER_SETTINGS_SCHEMA_VERSION,
  interfaceLanguage: 'ar',
  theme: 'system',
  defaultSessionDurationMinutes: 30,
});

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);
}

function isThemePreference(candidate: unknown): candidate is ThemePreference {
  return candidate === 'system' || candidate === 'light' || candidate === 'dark';
}

function isValidSessionDuration(candidate: unknown): candidate is number {
  return (
    typeof candidate === 'number' &&
    Number.isFinite(candidate) &&
    Number.isInteger(candidate) &&
    candidate >= MINIMUM_SESSION_DURATION_MINUTES &&
    candidate <= MAXIMUM_SESSION_DURATION_MINUTES
  );
}

function createDefaultUserSettings(): UserSettingsV1 {
  return { ...DEFAULT_USER_SETTINGS };
}

export function normalizeUserSettings(candidate: unknown): UserSettingsV1 {
  if (!isRecord(candidate) || candidate.schemaVersion !== USER_SETTINGS_SCHEMA_VERSION) {
    return createDefaultUserSettings();
  }

  return {
    schemaVersion: USER_SETTINGS_SCHEMA_VERSION,
    interfaceLanguage: candidate.interfaceLanguage === 'ar' ? candidate.interfaceLanguage : 'ar',
    theme: isThemePreference(candidate.theme) ? candidate.theme : DEFAULT_USER_SETTINGS.theme,
    defaultSessionDurationMinutes: isValidSessionDuration(candidate.defaultSessionDurationMinutes)
      ? candidate.defaultSessionDurationMinutes
      : DEFAULT_USER_SETTINGS.defaultSessionDurationMinutes,
  };
}

export function mergeUserSettings(currentSettings: UserSettingsV1, patch: UserSettingsPatch): UserSettingsV1 {
  return normalizeUserSettings({
    ...currentSettings,
    ...patch,
    schemaVersion: USER_SETTINGS_SCHEMA_VERSION,
    interfaceLanguage: 'ar',
  });
}
