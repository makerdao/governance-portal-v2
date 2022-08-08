import mockPolls from 'modules/polling/api/mocks/polls.json';
import { PollVictoryConditions } from 'modules/polling/polling.constants';
import { Poll } from 'modules/polling/types';
import { filterPolls } from '../filterPolls';

describe('filterPolls', () => {
  const formattedPolls: Poll[] = mockPolls.map(p => {
    return {
      ...p,
      endDate: new Date(p.endDate),
      startDate: new Date(p.startDate)
    };
  }) as any as Poll[];

  const filters = {
    title: null,
    startDate: null,
    endDate: null,
    categoryFilter: null,
    pollVictoryCondition: null,
    showPollActive: true,
    showPollEnded: true
  };

  it('returns all polls with no filter options passed', () => {
    const polls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters
      }
    });

    expect(polls).toEqual(formattedPolls);
    expect(polls.length).toEqual(2);
  });

  it('returns polls filtered by title', () => {
    const polls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters,
        title: 'protocol dai'
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by category', () => {
    const polls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters,
        categoryFilter: { test1: true }
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by poll type', () => {
    const polls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters,
        pollVictoryCondition: { [PollVictoryConditions.instantRunoff]: true }
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by active/ended', () => {
    const endedPolls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters,
        showPollActive: false
      }
    });

    expect(endedPolls.length).toEqual(0);

    const activePolls = filterPolls({
      polls: formattedPolls,
      pollFilters: {
        ...filters,
        showPollActive: true,
        showPollEnded: false
      }
    });

    expect(activePolls.length).toEqual(2);
  });
});
