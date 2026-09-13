import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { LAST_SAFE_ROUTE_KEY } from '../settings/navigationSettings';

describe('App', () => {
  it('starts with the privacy-first onboarding experience', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'اقرأ بهدف واضح' })).toBeInTheDocument();
    expect(screen.getByText('بياناتك تبقى على جهازك')).toBeInTheDocument();
  });

  it('saves onboarding locally and opens the library', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'ابدأ محليًا' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
    });
    expect(window.localStorage.getItem('onboardingComplete')).toBe('true');
    expect(window.location.hash).toBe('#/library');
    expect(window.localStorage.getItem(LAST_SAFE_ROUTE_KEY)).toBe('#/library');
  });

  it('restores a returning reader directly to the library', async () => {
    window.localStorage.setItem('onboardingComplete', 'true');
    window.localStorage.setItem(LAST_SAFE_ROUTE_KEY, '#/library');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
  });

  it('recovers from a corrupt saved route without a blank or crash', async () => {
    window.localStorage.setItem('onboardingComplete', 'true');
    window.localStorage.setItem(LAST_SAFE_ROUTE_KEY, 'corrupt');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/library');
  });

  it('renders exactly one main landmark after startup', async () => {
    render(<App />);

    await screen.findByRole('heading', { name: 'اقرأ بهدف واضح' });
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('recovers a changed invalid hash through the same route boundary', async () => {
    window.localStorage.setItem('onboardingComplete', 'true');
    render(<App />);
    await screen.findByRole('heading', { name: 'مكتبتي' });

    window.history.replaceState(null, '', '#/settings');
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'تعذر فتح الوجهة المطلوبة. أعدناك إلى آخر شاشة آمنة.',
    );
    expect(window.location.hash).toBe('#/library');
    expect(screen.getByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
  });

  it('keeps Library usable and announces a navigation-save failure', async () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, storedValue) {
      if (key === LAST_SAFE_ROUTE_KEY) {
        throw new Error('Storage unavailable');
      }

      originalSetItem.call(this, key, storedValue);
    });

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'ابدأ محليًا' }));

    expect(await screen.findByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'تم فتح الشاشة، لكن تعذر حفظها للاستعادة لاحقًا.',
    );
  });

  it('explains that current data is preserved when onboarding storage fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'ابدأ محليًا' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'تعذر حفظ البداية محليًا. لم تتغير بياناتك؛ حاول مرة أخرى.',
    );
    expect(screen.getByRole('button', { name: 'ابدأ محليًا' })).toBeEnabled();
  });
});
