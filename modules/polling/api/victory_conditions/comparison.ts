/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// Receives the currentVotes and the percentage required to be determined winner
import { PollTallyVote } from 'modules/polling/types';
import { parseEther } from 'viem';

function passComparator(value: bigint, comparator: string, threshold: number) {
  const thresholdBigInt = parseEther(threshold.toString());
  switch (comparator) {
    case '>':
      return value > thresholdBigInt;
    case '>=':
      return value >= thresholdBigInt;
    case '<':
      return value < thresholdBigInt;
    case '<=':
      return value <= thresholdBigInt;
    case '=':
    default:
      return value === thresholdBigInt;
  }
}

// Determines all the options that pass the comparison threshold
export function extractSatisfiesComparison(
  currentVotes: PollTallyVote[],
  comparator: string,
  value: number
): number[] {
  // Group votes by SKY support, remember that each vote has a ballot with possible many multiple options
  const votes: { [key: number]: bigint } = {};

  currentVotes.forEach(vote => {
    vote.ballot.forEach(votedOption => {
      if (votes[votedOption]) {
        votes[votedOption] = votes[votedOption] + parseEther(vote.skySupport.toString());
      } else {
        votes[votedOption] = parseEther(vote.skySupport.toString());
      }
    });
  });

  // Sort options by SKY support
  const sortedOptions = Object.keys(votes)
    .map(option => {
      return {
        option: parseInt(option),
        skySupport: votes[parseInt(option)]
      };
    })
    .sort((prev, next) => {
      return prev.skySupport > next.skySupport ? -1 : 1;
    });

  // Extract the first option that passes the comparator.
  const satisfies = sortedOptions
    .filter(vote => {
      return passComparator(vote.skySupport, comparator, value);
    })
    .map(v => v.option);

  return satisfies;
}
