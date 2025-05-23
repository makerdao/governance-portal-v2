/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollTallyVote } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { voteAddressMkrWeightsAtTime } from 'modules/gql/queries/subgraph/voteAddressSkyWeightsAtTime';
import { allMainnetVoters } from 'modules/gql/queries/subgraph/allMainnetVoters';
import { allArbitrumVoters } from 'modules/gql/queries/subgraph/allArbitrumVoters';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { formatEther } from 'viem';
import { SupportedChainId } from 'modules/web3/constants/chainID';

interface VoterData {
  id: string;
}

interface VoteData {
  voter: VoterData;
  choice: string;
  blockTime: number;
  txnHash: string;
}

interface MainnetVoteData {
  voter: VoterData;
  choice: string;
  blockTime: number;
  txnHash: string;
}

interface MainnetVotersResponse {
  pollVotes: MainnetVoteData[];
}

interface ArbitrumPollData {
  startDate: number;
  endDate: number;
  votes: VoteData[];
}

interface ArbitrumVotersResponse {
  arbitrumPoll: ArbitrumPollData;
}

interface VotingPowerChange {
  newBalance: string;
}

interface VoterWithWeight {
  id: string;
  v2VotingPowerChanges: VotingPowerChange[];
}

interface SkyWeightsResponse {
  voters: VoterWithWeight[];
}

export async function fetchVotesByAddressForPoll(
  pollId: number,
  delegateOwnerToAddress: Record<string, string>,
  network: SupportedNetworks
): Promise<PollTallyVote[]> {
  const arbitrumChainId =
    network === SupportedNetworks.MAINNET ? SupportedChainId.ARBITRUM : SupportedChainId.ARBITRUMTESTNET;

  const [mainnetVotersResponse, arbitrumVotersResponse] = await Promise.all([
    gqlRequest<MainnetVotersResponse>({
      chainId: networkNameToChainId(network),
      query: allMainnetVoters,
      variables: {
        argPollId: pollId.toString()
      }
    }),
    gqlRequest<ArbitrumVotersResponse>({
      chainId: arbitrumChainId,
      query: allArbitrumVoters,
      variables: {
        argPollId: pollId.toString()
      }
    })
  ]);

  const startUnix = arbitrumVotersResponse.arbitrumPoll.startDate;
  const endUnix = arbitrumVotersResponse.arbitrumPoll.endDate;

  const mainnetVotes = mainnetVotersResponse.pollVotes;
  const arbitrumVotes = arbitrumVotersResponse.arbitrumPoll.votes;

  const isVoteWithinPollTimeframe = vote => vote.blockTime >= startUnix && vote.blockTime <= endUnix;
  const mapToDelegateAddress = (voterAddress: string) => delegateOwnerToAddress[voterAddress] || voterAddress;

  const mainnetVoterAddresses = mainnetVotes.filter(isVoteWithinPollTimeframe).map(vote => vote.voter.id);
  const arbitrumVoterAddresses = arbitrumVotes
    .filter(isVoteWithinPollTimeframe)
    .map(vote => mapToDelegateAddress(vote.voter.id));

  const allVoterAddresses = [...mainnetVoterAddresses, ...arbitrumVoterAddresses];

  const addChainIdToVote = (vote, chainId) => ({ ...vote, chainId });

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
  const dedupedVotes = Object.values(
    allVotes.reduce((acc, vote) => {
      const voter = vote.voter.id;
      if (!acc[voter] || Number(vote.blockTime) > Number(acc[voter].blockTime)) {
        acc[voter] = vote;
      }
      return acc;
    }, {} as Record<string, (typeof allVotes)[0]>)
  );

  const skyWeightsResponse = await gqlRequest<SkyWeightsResponse>({
    chainId: networkNameToChainId(network),
    query: voteAddressMkrWeightsAtTime,
    variables: { argVoters: allVoterAddresses, argUnix: endUnix }
  });

  const votersWithWeights = skyWeightsResponse.voters || [];

  const votesWithWeights = dedupedVotes.map((vote: (typeof allVotes)[0]) => {
    const voterData = votersWithWeights.find(voter => voter.id === vote.voter.id);
    const votingPowerChanges = voterData?.v2VotingPowerChanges || [];
    const skySupport = votingPowerChanges.length > 0 ? votingPowerChanges[0].newBalance : '0';

    const ballot = parseRawOptionId(vote.choice.toString());
    return {
      skySupport,
      ballot,
      pollId,
      voter: vote.voter.id,
      chainId: vote.chainId,
      blockTimestamp: vote.blockTime,
      hash: vote.txnHash
    };
  });
  return votesWithWeights
    .sort((a, b) => (BigInt(a.skySupport) < BigInt(b.skySupport) ? 1 : -1))
    .map(vote => ({
      ...vote,
      skySupport: formatEther(BigInt(vote.skySupport))
    }));
}
