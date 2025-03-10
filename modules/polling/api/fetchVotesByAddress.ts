/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import BigNumber from 'lib/bigNumberJs';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollTallyVote } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { voteAddressMkrWeightsAtTime } from 'modules/gql/queries/subgraph/voteAddressMkrWeightsAtTime';
import { allMainnetVoters } from 'modules/gql/queries/subgraph/allMainnetVoters';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { formatUnits } from 'ethers/lib/utils';

export async function fetchVotesByAddressForPoll(
  pollId: number,
  endUnix: number,
  network: SupportedNetworks
): Promise<PollTallyVote[]> {
  const mainnetVotersResponse = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allMainnetVoters,
    useSubgraph: true,
    variables: {
      argPollId: pollId.toString()
    }
  });

  //TODO: filter out votes with timestamps out of range
  const mainnetVotes = mainnetVotersResponse.polls[0].votes
  const mainnetVoterAddresses = mainnetVotes.map(vote => vote.voter.id);

  //TODO: get list of arbitrum voters, and combine them (mapping delegate owners to their delegate contracts), only keeping latest vote if there's multiple votes
  const mkrWeightsResponse = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteAddressMkrWeightsAtTime,
    useSubgraph: true,
    variables: { argVoters: mainnetVoterAddresses, argUnix: endUnix }
  });
  const voteWeights = mkrWeightsResponse.executiveVotingPowerChanges;
  const votesWithWeights = mainnetVotes.map(vote => {
    const weightObj = voteWeights.find(weight => weight.voter.id === vote.voter.id);
    const weight = weightObj ? formatUnits(weightObj.newBalance) : formatUnits('0');
    const ballot = parseRawOptionId(vote.choice.toString());
    return {
      mkrSupport: weight,
      ballot,
      pollId,
      voter: vote.voter.id,
      chainId: networkNameToChainId(network),
      blockTimestamp: vote.blockTime,
      hash: vote.txnHash
    };
  });
  return votesWithWeights.sort((a, b) => (new BigNumber(a.weight).lt(new BigNumber(b.weight)) ? 1 : -1));
}
