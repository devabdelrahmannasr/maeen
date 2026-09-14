import { describe, expect, it, vi } from 'vitest';
import {
  readActiveDocumentContext,
  readActiveDocumentContextFromChrome,
  type ActiveDocumentBrowserPorts,
} from './chromeActiveDocumentContext';

function createPorts(overrides: Partial<ActiveDocumentBrowserPorts> = {}): ActiveDocumentBrowserPorts {
  return {
    tabs: {
      query: vi.fn().mockResolvedValue([{ title: 'Guide', url: 'https://example.test/guide.pdf' }]),
    },
    extension: {
      isAllowedFileSchemeAccess: vi.fn().mockResolvedValue(false),
    },
    ...overrides,
  };
}

describe('readActiveDocumentContext', () => {
  it('queries the active tab in the last focused window', async () => {
    const ports = createPorts();

    await readActiveDocumentContext(ports);

    expect(ports.tabs.query).toHaveBeenCalledTimes(1);
    expect(ports.tabs.query).toHaveBeenCalledWith({ active: true, lastFocusedWindow: true });
  });

  it('uses only the first returned active tab', async () => {
    const ports = createPorts();
    vi.mocked(ports.tabs.query).mockResolvedValue([
      { title: 'First', url: 'https://example.test/first.pdf' },
      { title: 'Second', url: 'https://example.test/second.pdf' },
    ]);

    const context = await readActiveDocumentContext(ports);

    expect(context).toMatchObject({ status: 'available', title: 'First', url: 'https://example.test/first.pdf' });
  });

  it('handles local-file access being enabled or disabled', async () => {
    const enabledPorts = createPorts();
    vi.mocked(enabledPorts.tabs.query).mockResolvedValue([{ title: 'Local', url: 'file:///C:/Books/local.pdf' }]);
    vi.mocked(enabledPorts.extension.isAllowedFileSchemeAccess).mockResolvedValue(true);

    await expect(readActiveDocumentContext(enabledPorts)).resolves.toMatchObject({
      status: 'available',
      source: 'local-file',
      fileAccess: 'allowed',
    });

    const disabledPorts = createPorts();
    vi.mocked(disabledPorts.tabs.query).mockResolvedValue([{ title: 'Local', url: 'file:///C:/Books/local.pdf' }]);

    await expect(readActiveDocumentContext(disabledPorts)).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'not-allowed',
      reason: 'file-access-not-granted',
    });
  });

  it('returns a safe state for missing sensitive metadata', async () => {
    const ports = createPorts();
    vi.mocked(ports.tabs.query).mockResolvedValue([{}]);

    await expect(readActiveDocumentContext(ports)).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'not-allowed',
      reason: 'url-unavailable',
    });
  });

  it('returns no-active-tab for an empty query result', async () => {
    const ports = createPorts();
    vi.mocked(ports.tabs.query).mockResolvedValue([]);

    await expect(readActiveDocumentContext(ports)).resolves.toEqual({
      status: 'no-active-tab',
      fileAccess: 'not-allowed',
      reason: 'no-active-tab',
    });
  });

  it('converts browser API rejection into a safe state', async () => {
    const queryFailurePorts = createPorts();
    vi.mocked(queryFailurePorts.tabs.query).mockRejectedValue(new Error('query unavailable'));
    await expect(readActiveDocumentContext(queryFailurePorts)).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'unknown',
      reason: 'active-tab-query-failed',
    });

    const fileAccessFailurePorts = createPorts();
    vi.mocked(fileAccessFailurePorts.tabs.query).mockResolvedValue([{ title: 'Local', url: 'file:///C:/Books/local.pdf' }]);
    vi.mocked(fileAccessFailurePorts.extension.isAllowedFileSchemeAccess).mockRejectedValue(new Error('permission unavailable'));
    await expect(readActiveDocumentContext(fileAccessFailurePorts)).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'unknown',
      reason: 'file-access-check-failed',
    });

    const unavailableMetadataPorts = createPorts();
    vi.mocked(unavailableMetadataPorts.tabs.query).mockResolvedValue([{}]);
    vi.mocked(unavailableMetadataPorts.extension.isAllowedFileSchemeAccess).mockRejectedValue(
      new Error('permission unavailable'),
    );
    await expect(readActiveDocumentContext(unavailableMetadataPorts)).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'unknown',
      reason: 'url-unavailable',
    });
  });

  it('wires the on-demand Chrome APIs without retaining browser metadata', async () => {
    const query = vi.fn().mockResolvedValue([
      { title: 'Guide', url: 'https://example.test/guide.pdf' },
    ]);
    const isAllowedFileSchemeAccess = vi.fn().mockResolvedValue(false);

    vi.stubGlobal('chrome', {
      tabs: { query },
      extension: { isAllowedFileSchemeAccess },
    });

    await expect(readActiveDocumentContextFromChrome()).resolves.toMatchObject({
      status: 'available',
      title: 'Guide',
      url: 'https://example.test/guide.pdf',
    });
    expect(query).toHaveBeenCalledWith({ active: true, lastFocusedWindow: true });
    expect(isAllowedFileSchemeAccess).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it('returns a typed unavailable state when Chrome APIs are absent', async () => {
    vi.stubGlobal('chrome', undefined);

    await expect(readActiveDocumentContextFromChrome()).resolves.toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'unknown',
      reason: 'browser-api-unavailable',
    });

    vi.unstubAllGlobals();
  });

  it('returns no storage, network, or page-content data', async () => {
    const ports = createPorts();
    const context = await readActiveDocumentContext(ports);

    expect(Object.keys(context).sort()).toEqual(['fileAccess', 'pdfConfidence', 'source', 'status', 'title', 'url'].sort());
  });
});
