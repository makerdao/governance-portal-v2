/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollTallyVote } from 'modules/polling/types';
import { parseEther } from 'viem';

export function extractWinnerPlurality(currentVotes: PollTallyVote[]): number | null {
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
      return prev.skySupport >= next.skySupport ? -1 : 1;
    });

  // if the 2 first options share the same SKY amount, return null
  if (sortedOptions.length >= 2) {
    if (sortedOptions[0].skySupport === sortedOptions[1].skySupport) {
      return null;
    }
  }

  const winner = sortedOptions.length > 0 ? sortedOptions[0].option : null;
  return winner;
}
