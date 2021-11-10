import { Poll } from './poll';
import { PollCategory } from './pollCategory';

export type PollFilters = {
  startDate?: Date | null;
  endDate?: Date | null;
  categories?: string[] | null;
  active?: boolean | null
};
export type PollsResponse = {
  polls: Poll[],
  categories: PollCategory[],
  stats: {
    active: number,
    finished: number,
    total: number
  }
}