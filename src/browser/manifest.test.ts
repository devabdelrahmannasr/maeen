import manifest from '../../public/manifest.json';
import { describe, expect, it } from 'vitest';

describe('Manifest V3 permission boundary', () => {
  it('declares only sidePanel, storage, and activeTab permissions', () => {
    expect([...manifest.permissions].sort()).toEqual(['activeTab', 'sidePanel', 'storage']);
    expect(manifest).not.toHaveProperty('host_permissions');
    expect(manifest).not.toHaveProperty('optional_host_permissions');
    expect(manifest).not.toHaveProperty('content_scripts');
  });
});
