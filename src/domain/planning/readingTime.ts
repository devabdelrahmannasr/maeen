export interface ReadingTimeInput {
  readonly totalPages: number;
  readonly currentPage: number;
  readonly availableMinutes: number;
  readonly deadline?: string;
  readonly today: string;
  readonly timeZone?: string;
}

export interface ReadingTimeResult {
  readonly remainingPages: number;
  readonly pagesPerMinute: number;
  readonly availableDays: number;
  readonly dailyPageTarget: number;
  readonly suggestedSessionMinutes: number;
}

function assertFinitePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be positive.`);
}

function parseDate(value: string, name: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value) || Number.isNaN(date.getTime())) throw new Error(`${name} must be YYYY-MM-DD.`);
  return date;
}

export function calculateReadingTime(input: ReadingTimeInput): ReadingTimeResult {
  assertFinitePositive(input.totalPages, 'totalPages');
  assertFinitePositive(input.availableMinutes, 'availableMinutes');
  if (!Number.isInteger(input.totalPages) || input.totalPages < 1) throw new Error('totalPages must be an integer.');
  if (!Number.isInteger(input.currentPage) || input.currentPage < 0 || input.currentPage >= input.totalPages) throw new Error('currentPage is outside the book.');
  const remainingPages = input.totalPages - input.currentPage;
  const pagesPerMinute = remainingPages / input.availableMinutes;
  const today = parseDate(input.today, 'today');
  let availableDays = 1;

  if (input.deadline !== undefined) {
    const deadline = parseDate(input.deadline, 'deadline');
    const difference = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
    if (difference < 0) throw new Error('deadline cannot be before today.');
    availableDays = difference + 1;
  }

  return {
    remainingPages,
    pagesPerMinute,
    availableDays,
    dailyPageTarget: Math.ceil(remainingPages / availableDays),
    suggestedSessionMinutes: Math.max(1, Math.ceil(Math.min(input.availableMinutes, remainingPages / Math.max(pagesPerMinute, 0.01)))),
  };
}
