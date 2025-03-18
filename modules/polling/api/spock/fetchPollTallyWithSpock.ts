/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll, PollTally, PollTallyOption } from 'modules/polling/types';
import { PollVictoryConditions } from '../../polling.constants';
import BigNumber from 'lib/bigNumberJs';
import { extractSatisfiesComparison } from '../victory_conditions/comparison';
import { hasVictoryConditionInstantRunOff } from '../../helpers/utils';
import { fetchVotesByAddressForPollWithSpock } from './fetchVotesByAddressWithSpock';
import { isExponential } from 'lib/utils';
import { InstantRunoffResults } from '../../types/instantRunoff';
import { findWinner } from '../fetchPollTally';

type WinnerOption = { winner: number | null; results: InstantRunoffResults | null };

export async function fetchPollTallyWithSpock(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  // Fetch spock votes for the poll
  const endUnix = new Date(poll.endDate).getTime() / 1000;

  const votesByAddress = await fetchVotesByAddressForPollWithSpock(poll.pollId, endUnix, network);

  // Abstain
  const abstain = poll.parameters.inputFormat.abstain ? poll.parameters.inputFormat.abstain : [0];

  let totalMkrParticipation = new BigNumber(0);
  let totalMkrActiveParticipation = new BigNumber(0);

  // Remove all the votes that voted "Abstain" in any option. (It should only be 1 abstain option)
  const filteredVotes = votesByAddress.filter(vote => {
    // Store the total MKR
    totalMkrParticipation = totalMkrParticipation.plus(vote.mkrSupport);
    if (vote.ballot.filter(i => abstain.indexOf(i) !== -1).length > 0) {
      return false;
    }

    totalMkrActiveParticipation = totalMkrActiveParticipation.plus(vote.mkrSupport);

    return true;
  });

  let winnerOption: WinnerOption = { winner: null, results: null };

  let victoryConditionMatched: number | null = null;

  // Victory conditions work like an "if-else", if the first does not find a winner, we move to the next one
  poll.parameters.victoryConditions.forEach((victoryGroup, index) => {
    // A winner has been found, skip.
    if (winnerOption.winner) {
      return;
    }

    if (victoryGroup.type === PollVictoryConditions.and) {
      // If all the winners are the same, and a winner is found, declare this the winner.
      let allTheSame = true;
      let allWinners = true;

      let andWinner: WinnerOption | null = null;

      victoryGroup.conditions.forEach(condition => {
        // Comparison is a filter
        if (condition.type === PollVictoryConditions.comparison) {
          // Comparison returns an array of options that satisfy the condition
          const satisfiesConditions = extractSatisfiesComparison(
            filteredVotes,
            condition.comparator,
            condition.value
          );
          if (satisfiesConditions.length === 0) {
            allWinners = false;
          }

          if (!andWinner?.winner) {
            andWinner = {
              winner: satisfiesConditions.length > 0 ? satisfiesConditions[0] : null,
              results: null
            };
          } else {
            // There's no winner that satisfies conditions
            if (satisfiesConditions.indexOf(andWinner.winner) === -1) {
              allTheSame = false;
            }
          }
          return;
        }

        // For all the other conditions except comparison, we find the winner and compare.
        const winnerOptionAnd = findWinner(condition, filteredVotes, poll);
        if (!winnerOptionAnd.winner) {
          allWinners = false;
          return;
        }

        if (andWinner && andWinner.winner !== winnerOptionAnd.winner) {
          allTheSame = false;
          return;
        }

        if (!andWinner) {
          andWinner = winnerOptionAnd;
        }
      });

      if (allTheSame && allWinners && andWinner) {
        winnerOption = andWinner;
        victoryConditionMatched = index;
      }
    } else {
      const winnerGroup = findWinner(victoryGroup, filteredVotes, poll);
      if (winnerGroup.winner) {
        winnerOption = winnerGroup;
        victoryConditionMatched = index;
      }
    }
  });

  // Format results
  const votesInfo: { [key: number]: BigNumber } = {};

  // needs to consider IRV without comparator threshold met when aggregating MKR
  const isIrv = hasVictoryConditionInstantRunOff(poll.parameters.victoryConditions);

  // Aggregate the MKR support
  votesByAddress.forEach(vote => {
    // if IRV and no winner, only consider weight from first ballot option
    if (isIrv && !winnerOption.results) {
      if (votesInfo[vote.ballot[0]]) {
        votesInfo[vote.ballot[0]] = votesInfo[vote.ballot[0]].plus(vote.mkrSupport);
      } else {
        votesInfo[vote.ballot[0]] = new BigNumber(vote.mkrSupport);
      }
    } else {
      // otherwise aggregate all votes
      vote.ballot.forEach(votedOption => {
        if (votesInfo[votedOption]) {
          votesInfo[votedOption] = votesInfo[votedOption].plus(vote.mkrSupport);
        } else {
          votesInfo[votedOption] = new BigNumber(vote.mkrSupport);
        }
      });
    }
  });

  // Form the results structure
  const results: PollTallyOption[] = Object.keys(poll.options)
    .map(key => {
      const optionId = parseInt(key);
      const instantRunoffOption = winnerOption.results?.options[optionId];

      // To get the real MKR support we need to get the one extracted from the ranked results, for instant-runoff, since
      // it will count the firstChoice MKR support based on the algorithm. Except for abstain
      // for other algorithms we just use the accumulated MKR

      const isAbstainOption = poll.parameters.inputFormat.abstain.indexOf(parseInt(key)) !== -1;

      const mkrSupport =
        winnerOption.results && !isAbstainOption
          ? instantRunoffOption?.mkrSupport || new BigNumber(0)
          : votesInfo[optionId] || new BigNumber(0);

      let firstPct: string | number = 0;
      let transferPct: string | number = 0;

      if (totalMkrParticipation.gt(0)) {
        const firstPctBn = new BigNumber(mkrSupport).div(totalMkrParticipation).times(100);

        // If firstPct has too many decimal places it will be cast as an exponential number, in which case we instead cast as a string
        firstPct = isExponential(firstPctBn.toNumber()) ? firstPctBn.toFixed(18) : firstPctBn.toNumber();

        if (instantRunoffOption?.transfer) {
          const transferPctBn = new BigNumber(instantRunoffOption?.transfer)
            .div(totalMkrParticipation)
            .times(100);

          // Same situation for transferPct, cast as a string with regular notation if necessary
          transferPct = isExponential(transferPctBn.toNumber())
            ? transferPctBn.toFixed(18)
            : transferPctBn.toNumber();
        }
      }

      return {
        optionId,
        winner: winnerOption.winner === optionId,
        mkrSupport: mkrSupport.toString(),
        optionName: poll.options[optionId],
        eliminated: instantRunoffOption?.eliminated,
        transfer: instantRunoffOption?.transfer?.toString(),
        firstPct,
        transferPct
      };
    })
    .sort((a, b) => {
      const valueA = new BigNumber(a.mkrSupport).plus(a.transfer || 0);
      const valueB = new BigNumber(b.mkrSupport).plus(b.transfer || 0);
      if (valueA.eq(valueB)) return a.optionName > b.optionName ? 1 : -1;
      return valueA.gt(valueB) ? -1 : 1;
    });

  const tally: PollTally = {
    parameters: poll.parameters,
    winner: winnerOption.winner ? winnerOption.winner : null,
    victoryConditionMatched,
    numVoters: votesByAddress.length,
    totalMkrParticipation: totalMkrParticipation.toString(),
    totalMkrActiveParticipation: totalMkrActiveParticipation.toString(),
    winningOptionName: winnerOption.winner ? poll.options[winnerOption.winner] : 'None found',
    results,
    rounds: winnerOption.results?.rounds,
    votesByAddress
  };

  return tally;
}
