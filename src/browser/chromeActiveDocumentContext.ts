import {
  classifyActiveDocument,
  isFileUrl,
  type ActiveDocumentContext,
  type ActiveTabMetadata,
} from './activeDocumentContext';

export interface ActiveTabQuery {
  active: true;
  lastFocusedWindow: true;
}

export interface ActiveTabQueryPort {
  query(query: ActiveTabQuery): Promise<ReadonlyArray<ActiveTabMetadata>>;
}

export interface FileSchemeAccessPort {
  isAllowedFileSchemeAccess(): Promise<boolean>;
}

export interface ActiveDocumentBrowserPorts {
  tabs: ActiveTabQueryPort;
  extension: FileSchemeAccessPort;
}

function unavailableContext(reason: string): ActiveDocumentContext {
  return {
    status: 'metadata-unavailable',
    fileAccess: 'unknown',
    reason,
  };
}

export async function readActiveDocumentContext(
  ports: ActiveDocumentBrowserPorts,
): Promise<ActiveDocumentContext> {
  let tabs: ReadonlyArray<ActiveTabMetadata>;

  try {
    tabs = await ports.tabs.query({ active: true, lastFocusedWindow: true });
  } catch {
    return unavailableContext('active-tab-query-failed');
  }

  const activeTab = tabs[0];
  let fileAccessAllowed = false;
  let fileAccessCheckFailed = false;

  try {
    fileAccessAllowed = await ports.extension.isAllowedFileSchemeAccess();
  } catch {
    fileAccessCheckFailed = true;
  }

  if (fileAccessCheckFailed && isFileUrl(activeTab?.url)) {
    return unavailableContext('file-access-check-failed');
  }

  const context = classifyActiveDocument(activeTab, fileAccessAllowed);

  if (fileAccessCheckFailed && context.status !== 'available') {
    return { ...context, fileAccess: 'unknown' };
  }

  return context;
}

function hasChromeActiveDocumentApis(): boolean {
  return typeof chrome !== 'undefined'
    && typeof chrome.tabs?.query === 'function'
    && typeof chrome.extension?.isAllowedFileSchemeAccess === 'function';
}

export function readActiveDocumentContextFromChrome(): Promise<ActiveDocumentContext> {
  if (!hasChromeActiveDocumentApis()) {
    return Promise.resolve(unavailableContext('browser-api-unavailable'));
  }

  return readActiveDocumentContext({
    tabs: {
      query: (query) => chrome.tabs.query(query),
    },
    extension: {
      isAllowedFileSchemeAccess: () => chrome.extension.isAllowedFileSchemeAccess(),
    },
  });
}
