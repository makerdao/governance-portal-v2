import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll, PollTally, PollTallyOption, VictoryCondition } from 'modules/polling/types';
import { extractWinnerPlurality } from './victory_conditions/plurality';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { voteMkrWeightsAtTimeRankedChoice } from 'modules/gql/queries/voteMkrWeightsAtTimeRankedChoice';
import { PollVictoryConditions } from '../polling.constants';
import { ParsedSpockVote, SpockVote } from '../types/tallyVotes';
import BigNumber from 'lib/bigNumberJs';
import { extractWinnerApproval } from './victory_conditions/approval';
import { extractWinnerMajority } from './victory_conditions/majority';
import { extractWinnerInstantRunoff } from './victory_conditions/instantRunoff';
import { extractWinnerDefault } from './victory_conditions/default';
import { InstantRunoffResults } from '../types/instantRunoff';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { extractSatisfiesComparison } from './victory_conditions/comparison';

type WinnerOption = { winner: number | null; results: InstantRunoffResults | null };

export function findWinner(condition: VictoryCondition, votes: ParsedSpockVote[], poll: Poll): WinnerOption {
  let results: InstantRunoffResults | null = null;

  switch (condition.type) {
    case PollVictoryConditions.approval:
      return {
        winner: extractWinnerApproval(votes),
        results
      };
    case PollVictoryConditions.majority:
      return { winner: extractWinnerMajority(votes, condition.percent), results };
    case PollVictoryConditions.plurality:
      return { winner: extractWinnerPlurality(votes), results };
    case PollVictoryConditions.instantRunoff:
      results = extractWinnerInstantRunoff(votes);
      return { winner: results ? results.winner : null, results };
    case PollVictoryConditions.default:
      return { winner: extractWinnerDefault(poll, condition.value), results };
    // In case comparison is set on the top level instead of inside a AND logic.
    // Inside of an AND logic, comparison is set as a filter to be complied with
    // on the top level we would take the first option that passes this condition and declare it a winner
    case PollVictoryConditions.comparison:
      return {
        winner:
          extractSatisfiesComparison(votes, condition.comparator, condition.value).length > 0
            ? extractSatisfiesComparison(votes, condition.comparator, condition.value)[0]
            : null,
        results
      };
    default:
      return {
        winner: null,
        results
      };
  }
}

export async function fetchPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  // Fetch spock votes for the poll
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteMkrWeightsAtTimeRankedChoice,
    variables: {
      argPollId: poll.pollId,
      argUnix: new Date(poll.endDate).getTime() / 1000
    }
  });

  const spockVotes: SpockVote[] = data.voteMkrWeightsAtTimeRankedChoice.nodes;

  // Transform the votes
  // extract the ballot or single votes based on the poll input format:
  const votes: ParsedSpockVote[] = spockVotes.map(vote => {
    return {
      ...vote,
      optionIdRaw: vote.optionIdRaw.toString(),
      ballot: parseRawOptionId(vote.optionIdRaw.toString())
    };
  });

  // Abstain
  const abstain = poll.parameters.inputFormat.abstain ? poll.parameters.inputFormat.abstain : [0];

  let totalMkrParticipation = new BigNumber(0);
  let totalMkrActiveParticipation = new BigNumber(0);

  // Remove all the votes that voted "Abstain" in any option. (It should only be 1 abstain option)
  const filteredVotes = votes.filter(vote => {
    // Store the total MKR
    totalMkrParticipation = totalMkrParticipation.plus(vote.mkrSupport);
    if (vote.ballot.filter(i => abstain.indexOf(i) !== -1).length > 0) {
      return false;
    }

    totalMkrActiveParticipation = totalMkrActiveParticipation.plus(vote.mkrSupport);

    return true;
  });

  let winnerOption: WinnerOption = { winner: null, results: null };

  // Victory conditions work like an "if-else", if the first does not find a winner, we move to the next one
  poll.parameters.victoryConditions.forEach(victoryGroup => {
    // A winner has found, skip.
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
      }
    } else {
      const winnerGroup = findWinner(victoryGroup, filteredVotes, poll);
      if (winnerGroup.winner) {
        winnerOption = winnerGroup;
      }
    }
  });

  // Format results
  const votesInfo: { [key: number]: BigNumber } = {};

  // Aggregate all the MKR support
  votes.forEach(vote => {
    vote.ballot.forEach(votedOption => {
      if (votesInfo[votedOption]) {
        votesInfo[votedOption] = votesInfo[votedOption].plus(vote.mkrSupport);
      } else {
        votesInfo[votedOption] = new BigNumber(vote.mkrSupport);
      }
    });
  });

  // Form the results structure
  const results: PollTallyOption[] = Object.keys(poll.options)
    .map(key => {
      const optionId = parseInt(key);
      const instantRunoffOption = winnerOption.results?.options[optionId];
      const mkrSupport =
        winnerOption.results
          ? instantRunoffOption?.mkrSupport || new BigNumber(0)
          : votesInfo[optionId] || new BigNumber(0);

      return {
        optionId,
        winner: winnerOption.winner === optionId,
        mkrSupport: mkrSupport.toString(),
        optionName: poll.options[optionId],
        eliminated: instantRunoffOption?.eliminated,
        transfer: instantRunoffOption?.transfer?.toString(),
        firstPct: totalMkrParticipation.gt(0)
          ? new BigNumber(mkrSupport).div(totalMkrParticipation).times(100).toNumber()
          : 0,
        transferPct:
          totalMkrParticipation.gt(0) && instantRunoffOption?.transfer
            ? new BigNumber(instantRunoffOption?.transfer).div(totalMkrParticipation).times(100).toNumber()
            : 0
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
    numVoters: spockVotes.length,
    totalMkrParticipation: totalMkrParticipation.toString(),
    totalMkrActiveParticipation: totalMkrActiveParticipation.toString(),
    winningOptionName: winnerOption.winner ? poll.options[winnerOption.winner] : 'None found',
    results,
    rounds: winnerOption.results?.rounds
  };

  return tally;
}
