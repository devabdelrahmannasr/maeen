import type { ReadingPlan } from './readingPlan';

export interface ReadingPlanRepository {
  get(id: string): Promise<ReadingPlan | null>;
  listForBook(bookId: string): Promise<readonly ReadingPlan[]>;
  save(plan: ReadingPlan): Promise<void>;
}
