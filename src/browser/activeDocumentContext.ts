export type ActiveDocumentSource = 'https' | 'local-file';
export type PdfConfidence = 'url-hint' | 'unknown';
export type ActiveDocumentUnavailableStatus = 'metadata-unavailable' | 'unsupported-scheme' | 'no-active-tab';
export type FileAccessState = 'allowed' | 'not-allowed' | 'unknown';

export interface ActiveTabMetadata {
  title?: unknown;
  url?: unknown;
}

export interface AvailableActiveDocumentContext {
  status: 'available';
  source: ActiveDocumentSource;
  title: string;
  url: string;
  pdfConfidence: PdfConfidence;
  fileAccess: FileAccessState | 'not-applicable';
}

export interface UnavailableActiveDocumentContext {
  status: ActiveDocumentUnavailableStatus;
  fileAccess: FileAccessState;
  reason: string;
}

export type ActiveDocumentContext =
  | AvailableActiveDocumentContext
  | UnavailableActiveDocumentContext;

export const EMPTY_DOCUMENT_TITLE = 'بدون عنوان';

function normalizeTitle(title: unknown): string {
  if (typeof title !== 'string') {
    return EMPTY_DOCUMENT_TITLE;
  }

  const trimmedTitle = title.trim();
  return trimmedTitle || EMPTY_DOCUMENT_TITLE;
}

function getUrlProtocol(url: unknown): string | null {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return null;
  }

  try {
    return new URL(url.trim()).protocol;
  } catch {
    return null;
  }
}

function unavailable(
  status: ActiveDocumentUnavailableStatus,
  fileAccess: FileAccessState,
  reason: string,
): UnavailableActiveDocumentContext {
  return { status, fileAccess, reason };
}

export function classifyActiveDocument(
  tab: ActiveTabMetadata | null | undefined,
  fileAccessAllowed: boolean,
): ActiveDocumentContext {
  const fileAccess: FileAccessState = fileAccessAllowed ? 'allowed' : 'not-allowed';

  if (!tab) {
    return unavailable('no-active-tab', fileAccess, 'no-active-tab');
  }

  if (typeof tab.url !== 'string' || tab.url.trim().length === 0) {
    return unavailable('metadata-unavailable', fileAccess, 'url-unavailable');
  }

  const rawUrl = tab.url.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return unavailable('metadata-unavailable', fileAccess, 'malformed-url');
  }

  if (parsedUrl.protocol === 'file:') {
    if (!fileAccessAllowed) {
      return unavailable('metadata-unavailable', 'not-allowed', 'file-access-not-granted');
    }

    return {
      status: 'available',
      source: 'local-file',
      title: normalizeTitle(tab.title),
      url: parsedUrl.href,
      pdfConfidence: parsedUrl.pathname.toLowerCase().endsWith('.pdf') ? 'url-hint' : 'unknown',
      fileAccess: 'allowed',
    };
  }

  if (parsedUrl.protocol !== 'https:') {
    return unavailable('unsupported-scheme', fileAccess, `unsupported-scheme:${parsedUrl.protocol}`);
  }

  return {
    status: 'available',
    source: 'https',
    title: normalizeTitle(tab.title),
    url: parsedUrl.href,
    pdfConfidence: parsedUrl.pathname.toLowerCase().endsWith('.pdf') ? 'url-hint' : 'unknown',
    fileAccess: 'not-applicable',
  };
}

export function isFileUrl(url: unknown): boolean {
  return getUrlProtocol(url) === 'file:';
}
