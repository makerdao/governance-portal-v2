/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollOrderByEnum, PollInputFormat } from 'modules/polling/polling.constants';
import { filterPollList } from '../fetchPolls';
import { mockPollList } from '../mocks/pollList';

const baseFilters = {
  pageSize: 30,
  page: 1,
  title: null,
  orderBy: PollOrderByEnum.nearestEnd,
  tags: null,
  status: null,
  type: null,
  startDate: null,
  endDate: null
};

describe('Filter polls', () => {
  test('Filter polls by title', () => {
    const filters = { ...baseFilters, title: 'oNboArd' };
    const filteredPollListIds = filterPollList(mockPollList, filters).polls.map(poll => poll.pollId);

    expect(filteredPollListIds).toEqual([966, 965, 961, 983]);
  });

  test('Filter polls by tags', () => {
    const filters = { ...baseFilters, tags: ['high-impact', 'budget'] };
    const filteredPollListIds = filterPollList(mockPollList, filters).polls.map(poll => poll.pollId);

    expect(filteredPollListIds).toEqual([960, 978, 976, 975, 974, 973, 972, 971, 970]);
  });

  test('Filter polls by start date', () => {
    const filters = { ...baseFilters, startDate: new Date('2023-03-14T00:00:00.000Z') };
    const filteredPollListIds = filterPollList(mockPollList, filters).polls.map(poll => poll.pollId);

    expect(filteredPollListIds).toEqual([967, 966, 965, 964, 982, 983]);
  });

  test('Filter polls by end date', () => {
    const filters = { ...baseFilters, endDate: new Date('2023-02-28T00:00:00.000Z') };
    const filteredPollListIds = filterPollList(mockPollList, filters).polls.map(poll => poll.pollId);

    expect(filteredPollListIds).toEqual([952, 951, 950]);
  });

  test('Filter polls by type', () => {
    const filtersOne = { ...baseFilters, type: [PollInputFormat.singleChoice] };
    const filtersTwo = { ...baseFilters, type: [PollInputFormat.rankFree] };
    const filtersThree = { ...baseFilters, type: [PollInputFormat.chooseFree] };

    const filteredPollListIdsOne = filterPollList(mockPollList, filtersOne).polls;
    const filteredPollListIdsTwo = filterPollList(mockPollList, filtersTwo).polls;
    const filteredPollListIdsThree = filterPollList(mockPollList, filtersThree).polls;

    expect(filteredPollListIdsOne).toHaveLength(23);
    expect(filteredPollListIdsTwo).toHaveLength(7);
    expect(filteredPollListIdsThree).toHaveLength(0);
  });

  test('Filter polls by multiple filters', () => {
    const filters = {
      ...baseFilters,
      title: 'ratification',
      tags: ['mips'],
      endDate: new Date('2023-03-27T00:00:00.000Z')
    };
    const filteredPollListIds = filterPollList(mockPollList, filters).polls.map(poll => poll.pollId);

    expect(filteredPollListIds).toEqual([977, 957, 952, 951, 950]);
  });
});
