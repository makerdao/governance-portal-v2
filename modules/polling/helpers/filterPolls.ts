import { PollVictoryConditions } from '../polling.constants';
import { Poll } from '../types';
import { findVictoryCondition, isActivePoll } from './utils';

type PollFilterInputs = {
  polls: Poll[];

  pollFilters: {
    title: string | null;
    startDate;
    endDate;
    categoryFilter: Record<string, boolean> | null;
    pollVictoryCondition: Record<string, boolean> | null;
    showPollActive: boolean;
    showPollEnded: boolean;
  };
};

// Functions for filtering polls based on the frontend main polling page needs
export function filterPolls({ polls, pollFilters }: PollFilterInputs): Poll[] {
  if (!pollFilters) return polls;
  const {
    title,
    startDate: start,
    endDate: end,
    categoryFilter,
    pollVictoryCondition,
    showPollActive,
    showPollEnded
  } = pollFilters;
  const startDate = start && new Date(start);
  const endDate = end && new Date(end);

  const noPollVictoryConditionsSelected =
    pollVictoryCondition === null || Object.values(pollVictoryCondition).every(t => !t);

  return (
    polls
      // title filter
      .filter(poll => {
        if (!title || title === '') return true;

        return poll.title.toLowerCase().includes(title.toLowerCase());
      })
      // date and category filters
      .filter(poll => {
        // check date filters first
        if (startDate && new Date(poll.endDate).getTime() < startDate.getTime()) return false;
        if (endDate && new Date(poll.endDate).getTime() > endDate.getTime()) return false;
        const tagArray = Object.keys(categoryFilter || {}).filter(t => !!(categoryFilter || {})[t]);
        if (tagArray.length > 0) {
          return tagArray.reduce((prev, next) => {
            return prev && poll.tags.filter(tag => tag.id === next).length > 0;
          }, true);
        }
        // if no category filters selected, return all, otherwise, check if poll contains category
        return true;
      })
      // active & ended filter
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
      // vote type filter
      .filter(poll => {
        if (!pollVictoryCondition) return true;

        const victoryConditions = Object.keys(pollVictoryCondition).filter(k => !!pollVictoryCondition[k]);

        return (
          noPollVictoryConditionsSelected ||
          victoryConditions.find(
            condition =>
              findVictoryCondition(poll.parameters.victoryConditions, condition as PollVictoryConditions)
                .length > 0
          )
        );
      })
  );
}
