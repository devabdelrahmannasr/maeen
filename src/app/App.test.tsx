import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

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
  });

  it('restores a returning reader directly to the library', async () => {
    window.localStorage.setItem('onboardingComplete', 'true');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'مكتبتي' })).toBeInTheDocument();
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
