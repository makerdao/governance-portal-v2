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
import { SKY_PORTAL_START_DATE } from 'modules/polling/polling.constants';
import { pollTimes } from 'modules/gql/queries/subgraph/pollTimes';


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
  executiveVotingPowerChangesV2: {
    blockTimestamp: string;
    newBalance: string;
  }[];
}

interface PollTimesResponse {
  polls: {
    startDate?: string;
    endDate?: string;
    id: string;
  }[];
}

function getMkrWeightAtTimestamp(weightHistory: VotingWeightHistoryResponse, timestamp: number): string {
  // Find the most recent weight entry that doesn't exceed the given timestamp
  const relevantEntry = weightHistory.executiveVotingPowerChangesV2
    .filter(entry => Number(entry.blockTimestamp) <= timestamp)
    .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))[0];
  return relevantEntry ? relevantEntry.newBalance : '0';
}

function isValidVote(vote: PollVoteResponse, pollTimes: PollTimesResponse): boolean {
  const poll = pollTimes.polls.find(p => p.id === vote.poll.id);
  const voteTime = Number(vote.blockTime);
  const pollStart = Number(poll?.startDate);
  const pollEnd = Number(poll?.endDate);
  return voteTime >= pollStart && voteTime <= pollEnd;
}

async function fetchAllCurrentVotesWithSubgraph(
  address: string,
  network: SupportedNetworks,
  startUnix: number,
): Promise<PollTallyVote[]> {
  const addressInfo = await getAddressInfo(address, network);
  const delegateOwnerAddress = addressInfo?.delegateInfo?.address;
  const arbitrumChainId = networkNameToChainId('arbitrum'); //update if we ever add support for arbitrum sepolia
  const [mainnetVotes, arbitrumVotes, weightHistory] = await Promise.all([
    gqlRequest<MainnetVotesResponse>({
      chainId: networkNameToChainId(network),
      query: allMainnetVotes,
      variables: { argAddress: address.toLowerCase() }
    }),
    gqlRequest<ArbitrumVotesResponse>({
      chainId: arbitrumChainId,
      query: allArbitrumVotes,
      variables: { argAddress: delegateOwnerAddress ? delegateOwnerAddress.toLowerCase() : address.toLowerCase() }
    }),
    gqlRequest<VotingWeightHistoryResponse>({
      chainId: networkNameToChainId(network),
      query: votingWeightHistory,
      variables: {
        argAddress: address.toLowerCase(),
      }
    })
  ]);


  const mainnetVotesWithChainId = mainnetVotes.pollVotes.map(vote => ({...vote, chainId: networkNameToChainId(network)}));
  const arbitrumVotesWithChainId = arbitrumVotes.arbitrumPollVotes.map(vote => ({...vote, chainId: arbitrumChainId}));
  const combinedVotes = [...mainnetVotesWithChainId, ...arbitrumVotesWithChainId];

    // Filter votes to only include those after startUnix
    const filteredCombinedVotes = combinedVotes.filter(vote => Number(vote.blockTime) >= startUnix);

  const dedupedVotes = Object.values(
    filteredCombinedVotes.reduce((acc, vote) => {
      const pollId = vote.poll.id;
      if (!acc[pollId] || Number(vote.blockTime) > Number(acc[pollId].blockTime)) {
        acc[pollId] = vote;
      }
      return acc;
    }, {} as Record<string, typeof combinedVotes[0]>)
  );
  
  //get the poll times for all polls voted in
  //This is a separate request because we needed to know the arbitrum poll ids first to pass in to the query
  const allPollIds = dedupedVotes.map(p => p.poll.id);
  const pollTimesRes = await gqlRequest<PollTimesResponse>({
    chainId: networkNameToChainId(network),
    query: pollTimes,
    variables: { argPollIds: allPollIds }
  });

  const validVotes = dedupedVotes.filter(vote => isValidVote(vote, pollTimesRes));

  const res: PollTallyVote[] = validVotes.map(o => {
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

export async function fetchAllCurrentVotes(address: string, network: SupportedNetworks): Promise<PollTallyVote[]> {
  const cutoffUnix = Math.floor(SKY_PORTAL_START_DATE.getTime() / 1000);
  const subgraphVotes = await fetchAllCurrentVotesWithSubgraph(address, network, cutoffUnix);
  return subgraphVotes;
}
