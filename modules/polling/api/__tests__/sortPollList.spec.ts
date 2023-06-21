/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { mockPollList } from '../mocks/pollList';
import { sortPollsBy } from 'modules/polling/helpers/sortPolls';
import { PollListItem } from 'modules/polling/types';
import { PollOrderByEnum } from 'modules/polling/polling.constants';

const mockPollIds = [967, 982, 980, 957, 956, 952];

const shufflePolls = (pollArray: PollListItem[]): PollListItem[] => {
  for (let i = pollArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pollArray[i];
    pollArray[i] = pollArray[j];
    pollArray[j] = temp;
  }
  return pollArray;
};

describe('Sort polls', () => {
  // All mock polls are ended, so this should sort them by endDate descending
  test('Sort polls by nearest end', () => {
    const filteredPollList = mockPollList.filter(({ pollId }) => mockPollIds.includes(pollId));

    const sortedPollListIds = shufflePolls(filteredPollList)
      .sort(sortPollsBy(PollOrderByEnum.nearestEnd))
      .map(poll => poll.pollId);

    expect(sortedPollListIds).toEqual([967, 982, 980, 957, 956, 952]);
  });

  // All mock polls are ended, so this should sort them by endDate ascending
  test('Sort polls by furthest end', () => {
    const filteredPollList = mockPollList.filter(({ pollId }) => mockPollIds.includes(pollId));

    const sortedPollListIds = shufflePolls(filteredPollList)
      .sort(sortPollsBy(PollOrderByEnum.furthestEnd))
      .map(poll => poll.pollId);

    expect(sortedPollListIds).toEqual([952, 956, 957, 980, 982, 967]);
  });

  // All mock polls are ended, so this should sort them by startDate descending
  test('Sort polls by nearest start', () => {
    const filteredPollList = mockPollList.filter(({ pollId }) => mockPollIds.includes(pollId));

    const sortedPollListIds = shufflePolls(filteredPollList)
      .sort(sortPollsBy(PollOrderByEnum.nearestStart))
      .map(poll => poll.pollId);

    expect(sortedPollListIds).toEqual([982, 967, 980, 957, 956, 952]);
  });

  // All mock polls are ended, so this should sort them by startDate ascending
  test('Sort polls by furthest start', () => {
    const filteredPollList = mockPollList.filter(({ pollId }) => mockPollIds.includes(pollId));

    const sortedPollListIds = shufflePolls(filteredPollList)
      .sort(sortPollsBy(PollOrderByEnum.furthestStart))
      .map(poll => poll.pollId);

    expect(sortedPollListIds).toEqual([952, 956, 957, 980, 967, 982]);
  });
});
