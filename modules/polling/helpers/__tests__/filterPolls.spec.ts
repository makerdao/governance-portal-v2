import mockPolls from 'modules/polling/api/mocks/polls.json';
import { filterPolls } from '../filterPolls';

describe('filterPolls', () => {
  const filters = {
    title: null,
    startDate: null,
    endDate: null,
    categoryFilter: null,
    pollVoteType: null,
    showPollActive: true,
    showPollEnded: true
  };

  it('returns all polls with no filter options passed', () => {
    const polls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters
      }
    });

    expect(polls).toEqual(mockPolls);
    expect(polls.length).toEqual(2);
  });

  it('returns polls filtered by title', () => {
    const polls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters,
        title: 'protocol dai'
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by category', () => {
    const polls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters,
        categoryFilter: { test1: true }
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by poll type', () => {
    const polls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters,
        pollVoteType: { 'Ranked Choice IRV': true }
      }
    });

    expect(polls.length).toEqual(1);
  });

  it('returns polls filtered by active/ended', () => {
    const endedPolls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters,
        showPollActive: false
      }
    });

    expect(endedPolls.length).toEqual(0);

    const activePolls = filterPolls({
      polls: mockPolls,
      pollFilters: {
        ...filters,
        showPollActive: true,
        showPollEnded: false
      }
    });

    expect(activePolls.length).toEqual(2);
  });
});
