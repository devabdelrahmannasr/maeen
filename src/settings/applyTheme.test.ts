import { describe, expect, it } from 'vitest';
import { applyTheme } from './applyTheme';

describe('applyTheme', () => {
  it.each(['light', 'dark'] as const)('sets an explicit %s theme', (theme) => {
    applyTheme(theme);
    expect(document.documentElement.dataset.theme).toBe(theme);
  });

  it('removes the explicit override for the system theme', () => {
    document.documentElement.dataset.theme = 'dark';
    applyTheme('system');
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });
});
