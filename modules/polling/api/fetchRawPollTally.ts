import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll, PollParameters, RawPollTally } from 'modules/polling/types';
import { fetchTallyPlurality } from './victory_conditions/plurality';
import { fetchTallyRankedChoice } from './fetchTallyRankedChoice';
import { hasVictoryConditionPlurality, isInputFormatSingleChoice } from '../helpers/utils';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { voteMkrWeightsAtTimeRankedChoice } from 'modules/gql/queries/voteMkrWeightsAtTimeRankedChoice';
import { PollVictoryConditions } from '../polling.constants';
import { ParsedSpockVote, SpockVote } from '../types/tallyVotes';
import { paddedArray, toBuffer } from 'lib/utils';


function extractBallotFromSpockVotes(spockVotes:SpockVote[] ): {

}
export async function fetchRawPollTally(poll: Poll, network: SupportedNetworks): Promise<RawPollTally> {

  // Fetch spock votes for the poll
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteMkrWeightsAtTimeRankedChoice,
    variables: {
      argPollId: poll.pollId,
      argUnix: poll.endDate
    }
  });

  const spockVotes: SpockVote[] =
    data.voteMkrWeightsAtTimeRankedChoice.nodes;

  // Transform the votes 

  // Iterate every group if the winner is not found in a group
  let hasFoundWinner = false;
  let tally;

  // extract the ballot or single votes based on the poll input format:
  const votes: ParsedSpockVote[] =
    spockVotes.map(vote => {
      const ballotBuffer = toBuffer(vote.optionIdRaw, { endian: 'little' });
      const ballot = isInputFormatSingleChoice(poll.parameters) ? [vote.optionIdRaw] : paddedArray(32 - ballotBuffer.length, ballotBuffer);

      return {
        ...vote,
        optionIdRaw: vote.optionIdRaw.toString(),
        ballot
      };
    });

  // Abstain
  const abstain = poll.parameters.inputFormat.abstain ? poll.parameters.inputFormat.abstain : [0];

  // Remove all the votes that voted "Abstain" in any option. (It should only be 1 abstain option)
  const filtered = votes.filter(vote => {
    if (vote.ballot.filter(i => abstain.indexOf(i) !== -1).length > 0) {
      return false;
    }
    return true;
  });

  poll.parameters.victoryConditions.forEach(victoryGroup => {
    if (victoryGroup.type === PollVictoryConditions.and) {
      const andGroupResults = []
      victoryGroup.conditions.forEach((andConditionGroup) => {
        if (andConditionGroup.type === PollVictoryConditions.approval) {

        }
      });
    }
  })

  // Calculate now the winner based on the victory conditions.

  // Every first order victory condition acts as an "if-else", 
  // If there's a majority option 

  // If theres a "default" option, check if there is no winner, and attach it to the default

  // TODO: Include majority victory conditions calculations and approval
  const isPlurality = hasVictoryConditionPlurality(poll.parameters.victoryConditions);

  const victoryGroups = poll.parameters.victoryConditions;

  // get spock votes

  if (isPlurality) {
    tally = await fetchTallyPlurality(votes);
  } else {
    tally = await fetchTallyRankedChoice(votes);
  }

  return tally;
}
