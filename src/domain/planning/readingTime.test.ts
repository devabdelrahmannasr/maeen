import { describe, expect, it } from 'vitest';
import { calculateReadingTime } from './readingTime';

describe('calculateReadingTime', () => {
  it('uses inclusive deadline days and rounds daily pages up', () => {
    expect(calculateReadingTime({ totalPages: 100, currentPage: 10, availableMinutes: 60, today: '2026-09-14', deadline: '2026-09-16' })).toMatchObject({ remainingPages: 90, availableDays: 3, dailyPageTarget: 30 });
  });

  it('rejects impossible input', () => {
    expect(() => calculateReadingTime({ totalPages: 10, currentPage: 11, availableMinutes: 30, today: '2026-09-14' })).toThrow();
    expect(() => calculateReadingTime({ totalPages: 10, currentPage: 1, availableMinutes: 30, today: '2026-09-16', deadline: '2026-09-14' })).toThrow();
  });
});
