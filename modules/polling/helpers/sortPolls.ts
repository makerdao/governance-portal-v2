import { PollOrderByEnum } from '../polling.constants';
import { PollListItem } from '../types';

export const sortPollsBy =
  (orderBy: PollOrderByEnum) =>
  (a: PollListItem, b: PollListItem): number => {
    const startA = new Date(a.startDate).getTime();
    const endA = new Date(a.endDate).getTime();
    const startB = new Date(b.startDate).getTime();
    const endB = new Date(b.endDate).getTime();
    const currentTime = new Date().getTime();

    const isActiveA = currentTime >= startA && currentTime < endA;
    const isActiveB = currentTime >= startB && currentTime < endB;

    // Sort active polls before ended polls
    if (isActiveA && !isActiveB) {
      return -1;
    }
    if (!isActiveA && isActiveB) {
      return 1;
    }

    // If both polls have the same status (active or ended), sort them by the `orderBy` parameter
    switch (orderBy) {
      case PollOrderByEnum.nearestEnd:
        return isActiveA ? endA - endB : endB - endA;
      case PollOrderByEnum.furthestEnd:
        return isActiveA ? endB - endA : endA - endB;
      case PollOrderByEnum.nearestStart:
        return isActiveA ? startA - startB : startB - startA;
      default:
        return isActiveA ? startB - startA : startA - startB;
    }
  };
