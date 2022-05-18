import { Poll, PollVoteType } from '../types';
import { isActivePoll } from './utils';

type PollFilterInputs = {
  polls: Poll[];
  start;
  end;
  categoryFilter: Record<string, boolean> | null;
  pollVoteType: PollVoteType | null;
  showPollActive: boolean;
  showPollEnded: boolean;
};

// Functions for filtering polls based on the frontend main polling page needs
export function filterPolls({
  polls,
  start,
  end,
  categoryFilter,
  pollVoteType,
  showPollActive,
  showPollEnded
}: PollFilterInputs): Poll[] {
  const startDate = start && new Date(start);
  const endDate = end && new Date(end);

  const noCategoriesSelected = categoryFilter === null || Object.values(categoryFilter).every(c => !c);

  return polls
    .filter(poll => {
      // check date filters first
      if (startDate && new Date(poll.endDate).getTime() < startDate.getTime()) return false;
      if (endDate && new Date(poll.endDate).getTime() > endDate.getTime()) return false;

      // if no category filters selected, return all, otherwise, check if poll contains category
      return noCategoriesSelected || poll.categories.some(c => categoryFilter && categoryFilter[c]);
    })
    .filter(poll => {
      if (!showPollEnded && !showPollActive) {
        return true;
      }
      if (!showPollEnded && !isActivePoll(poll)) {
        return false;
      }
      if (!showPollActive && isActivePoll(poll)) {
        return false;
      }
      return true;
    })
    .filter(poll => {
      if (!pollVoteType) return true;

      return poll.voteType === pollVoteType;
    });
}
