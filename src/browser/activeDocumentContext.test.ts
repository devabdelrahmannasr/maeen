import { describe, expect, it } from 'vitest';
import {
  classifyActiveDocument,
  EMPTY_DOCUMENT_TITLE,
  type ActiveTabMetadata,
} from './activeDocumentContext';

describe('classifyActiveDocument', () => {
  it('accepts an HTTPS PDF reference and marks only a URL hint', () => {
    expect(classifyActiveDocument({ title: '  دليل القراءة  ', url: 'https://example.test/guide.pdf?download=1' }, false)).toEqual({
      status: 'available',
      source: 'https',
      title: 'دليل القراءة',
      url: 'https://example.test/guide.pdf?download=1',
      pdfConfidence: 'url-hint',
      fileAccess: 'not-applicable',
    });
  });

  it('accepts an HTTPS reference without claiming PDF verification', () => {
    expect(classifyActiveDocument({ title: 'Technical Guide', url: 'https://example.test/read?id=42' }, false)).toMatchObject({
      status: 'available',
      source: 'https',
      pdfConfidence: 'unknown',
      fileAccess: 'not-applicable',
    });
  });

  it('accepts a local PDF only when file access is enabled', () => {
    expect(classifyActiveDocument({ title: 'Local book', url: 'file:///C:/Books/guide.pdf' }, true)).toEqual({
      status: 'available',
      source: 'local-file',
      title: 'Local book',
      url: 'file:///C:/Books/guide.pdf',
      pdfConfidence: 'url-hint',
      fileAccess: 'allowed',
    });

    expect(classifyActiveDocument({ title: 'Local book', url: 'file:///C:/Books/guide.pdf' }, false)).toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'not-allowed',
      reason: 'file-access-not-granted',
    });
  });

  it('uses a local fallback for an empty or missing title', () => {
    expect(classifyActiveDocument({ title: '   ', url: 'https://example.test/guide.pdf' }, false)).toMatchObject({
      status: 'available',
      title: EMPTY_DOCUMENT_TITLE,
    });
    expect(classifyActiveDocument({ url: 'https://example.test/guide.pdf' }, false)).toMatchObject({
      status: 'available',
      title: EMPTY_DOCUMENT_TITLE,
    });
  });

  it.each([
    ['http://example.test/guide.pdf', 'unsupported-scheme:http:'],
    ['chrome://extensions', 'unsupported-scheme:chrome:'],
    ['edge://settings', 'unsupported-scheme:edge:'],
  ])('rejects unsupported scheme %s', (url, reason) => {
    expect(classifyActiveDocument({ title: 'Restricted', url }, false)).toEqual({
      status: 'unsupported-scheme',
      fileAccess: 'not-allowed',
      reason,
    });
  });

  it('reports malformed and missing metadata without throwing', () => {
    expect(classifyActiveDocument({ title: 'Broken', url: 'not a URL' }, false)).toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'not-allowed',
      reason: 'malformed-url',
    });
    expect(classifyActiveDocument({ title: 'No URL' }, false)).toEqual({
      status: 'metadata-unavailable',
      fileAccess: 'not-allowed',
      reason: 'url-unavailable',
    });
    expect(classifyActiveDocument(null, true)).toEqual({
      status: 'no-active-tab',
      fileAccess: 'allowed',
      reason: 'no-active-tab',
    });
  });

  it('does not mutate tab metadata', () => {
    const tab: ActiveTabMetadata = { title: '  Guide  ', url: 'https://example.test/guide.pdf' };
    const originalTab = { ...tab };

    classifyActiveDocument(tab, false);

    expect(tab).toEqual(originalTab);
  });
});
