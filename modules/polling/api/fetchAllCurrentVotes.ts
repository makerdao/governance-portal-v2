/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { allMainnetVotes } from 'modules/gql/queries/subgraph/allMainnetVotes';
import { allArbitrumVotes } from 'modules/gql/queries/subgraph/allArbitrumVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { PollTallyVote } from '../types';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import { votingWeightHistory } from 'modules/gql/queries/subgraph/votingWeightHistory';
import { formatEther } from 'viem';


interface PollVoteResponse {
  poll: {
    id: string;
  };
  choice: string;
  blockTime: string;
  txnHash: string;
}

interface MainnetVotesResponse {
  pollVotes: PollVoteResponse[];
}

interface ArbitrumPollVoteResponse extends PollVoteResponse {
  voter: {
    id: string;
  };
}

interface ArbitrumVotesResponse {
  arbitrumPollVotes: ArbitrumPollVoteResponse[];
}

interface VotingWeightHistoryResponse {
  executiveVotingPowerChanges: {
    blockTimestamp: string;
    newBalance: string;
  }[];
}

function getMkrWeightAtTimestamp(weightHistory: VotingWeightHistoryResponse, timestamp: number): string {
  // Find the most recent weight entry that doesn't exceed the given timestamp
  const relevantEntry = weightHistory.executiveVotingPowerChanges
    .filter(entry => Number(entry.blockTimestamp) <= timestamp)
    .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))[0];
  return relevantEntry ? relevantEntry.newBalance : "0";
}

export async function fetchAllCurrentVotes(
  address: string,
  network: SupportedNetworks
): Promise<PollTallyVote[]> {
  const addressInfo = await getAddressInfo(address, network);
  const delegateOwnerAddress = addressInfo?.delegateInfo?.address;
  const arbitrumChainId = networkNameToChainId('arbitrum'); //update if we ever add support for arbitrum sepolia
  const [mainnetVotes, arbitrumVotes, weightHistory] = await Promise.all([
    gqlRequest<MainnetVotesResponse>({
      chainId: networkNameToChainId(network),
      query: allMainnetVotes,
      useSubgraph: true,
      variables: { argAddress: address.toLowerCase() }
    }),
    gqlRequest<ArbitrumVotesResponse>({
      chainId: arbitrumChainId,
      query: allArbitrumVotes,
      useSubgraph: true,
      variables: { argAddress: delegateOwnerAddress ? delegateOwnerAddress.toLowerCase() : address.toLowerCase() }
    }),
    gqlRequest<VotingWeightHistoryResponse>({
      chainId: networkNameToChainId(network),
      query: votingWeightHistory,
      useSubgraph: true,
      variables: {
        argAddress: address.toLowerCase(),
      }
    })
  ]);


  const mainnetVotesWithChainId = mainnetVotes.pollVotes.map(vote => ({...vote, chainId: networkNameToChainId(network)}));
  const arbitrumVotesWithChainId = arbitrumVotes.arbitrumPollVotes.map(vote => ({...vote, chainId: arbitrumChainId}));
  const combinedVotes = [...mainnetVotesWithChainId, ...arbitrumVotesWithChainId];

  const dedupedVotes = Object.values(
    combinedVotes.reduce((acc, vote) => {
      const pollId = vote.poll.id;
      if (!acc[pollId] || Number(vote.blockTime) > Number(acc[pollId].blockTime)) {
        acc[pollId] = vote;
      }
      return acc;
    }, {} as Record<string, typeof combinedVotes[0]>)
  );
  
  //TODO: only include valid votes based on time of poll

  // Parse the rankedChoice option
  const res: PollTallyVote[] = dedupedVotes.map(o => {
    const ballot = parseRawOptionId(o.choice);
    const mkrSupport = getMkrWeightAtTimestamp(weightHistory, Number(o.blockTime));
    
    return {
      pollId: Number(o.poll.id),
      ballot,
      voter: address,
      hash: o.txnHash,
      blockTimestamp: Number(o.blockTime) * 1000,
      mkrSupport: Number(formatEther(BigInt(mkrSupport))),
      chainId: o.chainId,
    };
  });
  return res;
}
