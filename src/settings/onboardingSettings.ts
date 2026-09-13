const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

export async function getOnboardingComplete(): Promise<boolean> {
  if (hasChromeStorage()) {
    const storedSettings = await chrome.storage.local.get(ONBOARDING_COMPLETE_KEY);
    return storedSettings[ONBOARDING_COMPLETE_KEY] === true;
  }

  return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
}

export async function setOnboardingComplete(isComplete: boolean): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [ONBOARDING_COMPLETE_KEY]: isComplete });
    return;
  }

  window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, String(isComplete));
}
