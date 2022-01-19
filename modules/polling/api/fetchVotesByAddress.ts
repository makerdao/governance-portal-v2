import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import { getNetwork } from 'lib/maker';
import { PollTallyVote } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { networkNameToChainId, toBuffer, paddedArray } from 'modules/web3/helpers';
import { voteAddressMkrWeightsAtTime } from 'modules/gql/queries/voteAddressMkrWeightsAtTime';

export async function fetchVotesByAddresForPoll(
  pollId: number,
  endUnix: number,
  network?: SupportedNetworks
): Promise<PollTallyVote[]> {
  const currentNetwork = network || getNetwork();

  const data = await gqlRequest({
    chainId: networkNameToChainId(currentNetwork),
    query: voteAddressMkrWeightsAtTime,
    variables: { argPollId: pollId, argUnix: endUnix }
  });

  const results = data.voteAddressMkrWeightsAtTime.nodes;

  if (!results) return [];

  const votes = results.map(vote => {
    let rankedChoiceOption: any[] | null = null;
    if (vote.optionIdRaw) {
      const ballotBuffer = toBuffer(vote.optionIdRaw, { endian: 'little' });
      const ballot = paddedArray(32 - ballotBuffer.length, ballotBuffer);
      rankedChoiceOption = ballot.reverse().filter(choice => choice !== 0);
    }
    return {
      ...vote,
      rankedChoiceOption
    };
  });

  return votes.sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));
}
