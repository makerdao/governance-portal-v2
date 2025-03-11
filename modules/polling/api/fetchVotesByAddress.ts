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

  const startUnix = mainnetVotersResponse.polls[0].startDate;
  const endUnix = mainnetVotersResponse.polls[0].endDate;

  const mainnetVotes = mainnetVotersResponse.polls[0].votes
  const mainnetVoterAddresses = mainnetVotes.filter(vote => vote.blockTime >= startUnix && vote.blockTime <= endUnix).map(vote => vote.voter.id);


  //TODO: get list of arbitrum voters, and combine them (mapping delegate owners to their delegate contracts), only keeping latest vote if there's multiple votes
  const mkrWeightsResponse = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteAddressMkrWeightsAtTime,
    useSubgraph: true,
    variables: { argVoters: mainnetVoterAddresses, argUnix: endUnix }
  });
  
  const votersWithWeights = mkrWeightsResponse.voters || [];
  
  const votesWithWeights = mainnetVotes.map(vote => {
    const voterData = votersWithWeights.find(voter => voter.id === vote.voter.id);
    const votingPowerChanges = voterData?.votingPowerChanges || [];
    const mkrSupport = votingPowerChanges.length > 0 
      ? formatUnits(votingPowerChanges[0].newBalance) 
      : formatUnits('0');
    
    const ballot = parseRawOptionId(vote.choice.toString());
    return {
      mkrSupport,
      ballot,
      pollId,
      voter: vote.voter.id,
      chainId: networkNameToChainId(network),
      blockTimestamp: vote.blockTime,
      hash: vote.txnHash
    };
  });
  
  return votesWithWeights.sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));
}
