import { describe, expect, it } from 'vitest';
import { METRICS_PRIVACY_CONTRACT, METRICS_PRIVACY_NOTICE_AR } from './metricsPrivacy';

describe('metrics privacy contract', () => {
  it('is explicit and local-only', () => {
    expect(METRICS_PRIVACY_CONTRACT).toEqual({ storage: 'IndexedDB only', network: 'none', identifiers: 'local record IDs only', documentContent: 'never accessed', sourceVersion: 1 });
    expect(METRICS_PRIVACY_NOTICE_AR).toContain('محلية فقط');
  });
});
