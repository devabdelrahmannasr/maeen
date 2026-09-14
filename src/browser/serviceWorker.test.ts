import { afterEach, describe, expect, it, vi } from 'vitest';

describe('service worker action flow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('opens the side panel from the explicit action gesture', async () => {
    const installedListeners: Array<() => void> = [];
    const actionListeners: Array<(tab: { id?: number }) => void> = [];
    const setPanelBehavior = vi.fn().mockResolvedValue(undefined);
    const open = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('chrome', {
      runtime: {
        onInstalled: {
          addListener: (listener: () => void) => installedListeners.push(listener),
        },
      },
      action: {
        onClicked: {
          addListener: (listener: (tab: { id?: number }) => void) => actionListeners.push(listener),
        },
      },
      sidePanel: { setPanelBehavior, open },
    });

    // The service worker is copied to dist as a static Manifest V3 entry.
    // @ts-expect-error Public JavaScript files are intentionally outside the TypeScript source tree.
    await import('../../public/service-worker.js?work-020-test');

    expect(installedListeners).toHaveLength(1);
    expect(actionListeners).toHaveLength(1);

    installedListeners[0]?.();
    expect(setPanelBehavior).toHaveBeenCalledWith({ openPanelOnActionClick: false });

    actionListeners[0]?.({});
    expect(open).not.toHaveBeenCalled();

    actionListeners[0]?.({ id: 42 });
    expect(open).toHaveBeenCalledWith({ tabId: 42 });
  });
});
