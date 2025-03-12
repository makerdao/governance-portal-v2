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
import { allArbitrumVoters } from 'modules/gql/queries/subgraph/allArbitrumVoters';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { formatUnits } from 'ethers/lib/utils';

export async function fetchVotesByAddressForPoll(
  pollId: number,
  delegateOwnerToAddress: Record<string, string>,
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

  const arbitrumChainId = networkNameToChainId('arbitrum');//update if we ever want to support an arbitrum sepolia subgraph

  const arbitrumVotersResponse = await gqlRequest({
    chainId: arbitrumChainId,
    query: allArbitrumVoters,
    useSubgraph: true,
    variables: {
      argPollId: pollId.toString()
    }
  });

  const arbitrumVotes = arbitrumVotersResponse.arbitrumPollVotes;
  
  const mapToDelegateAddress = voterAddress => delegateOwnerToAddress[voterAddress] || voterAddress;
  
  const isVoteWithinPollTimeframe = vote => vote.blockTime >= startUnix && vote.blockTime <= endUnix;
  
  const arbitrumVoterAddresses = arbitrumVotes
    .filter(isVoteWithinPollTimeframe)
    .map(vote => mapToDelegateAddress(vote.voter.id));
  
  const allVoterAddresses = [...mainnetVoterAddresses, ...arbitrumVoterAddresses];
  
  const addChainIdToVote = (vote, chainId) => ({...vote, chainId});
  
  const mainnetVotesWithChainId = mainnetVotes.map(vote => 
    addChainIdToVote(vote, networkNameToChainId(network))
  );
  
  const arbitrumVotesTaggedWithChainId = arbitrumVotes.map(vote => {
    const mappedAddress = mapToDelegateAddress(vote.voter.id);
    return {
      ...vote, 
      chainId: arbitrumChainId,
      voter: { ...vote.voter, id: mappedAddress }
    };
  });
  
  const allVotes = [...mainnetVotesWithChainId, ...arbitrumVotesTaggedWithChainId];

  const mkrWeightsResponse = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: voteAddressMkrWeightsAtTime,
    useSubgraph: true,
    variables: { argVoters: allVoterAddresses, argUnix: endUnix }
  });
  
  const votersWithWeights = mkrWeightsResponse.voters || [];
  
  const votesWithWeights = allVotes.map(vote => {
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
      chainId: vote.chainId,
      blockTimestamp: vote.blockTime,
      hash: vote.txnHash,
      optionIdRaw: vote.choice
    };
  });
  return votesWithWeights.sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));
}
