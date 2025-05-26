/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// Receives the currentVotes and the percentage required to be determined winner
import { PollTallyVote } from 'modules/polling/types';
import { formatEther, parseEther } from 'viem';

// Determines the winner of a majority algorithm. The percent is a number between 0-100 and it determines that the winner has to have more than "percent" of the SKY.
export function extractWinnerMajority(currentVotes: PollTallyVote[], percent: number): number | null {
  // Group votes by SKY support, remember that each vote has a ballot with possible many multiple options
  const votes: { [key: number]: bigint } = {};
  let totalSky = 0n;

  currentVotes.forEach(vote => {
    totalSky = totalSky + parseEther(vote.skySupport.toString());

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
      return prev.skySupport >= next.skySupport ? -1 : 1;
    });

  const mostVoted = sortedOptions[0];

  if (!mostVoted) {
    return null;
  }

  // Check percentage of majority
  if (+formatEther(mostVoted.skySupport) / +formatEther(totalSky) >= (percent > 0 ? percent / 100 : 0)) {
    return mostVoted.option;
  }

  // Does not pass majority
  return null;
}
