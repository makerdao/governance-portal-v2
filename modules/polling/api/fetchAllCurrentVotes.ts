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

export async function fetchAllCurrentVotes(
  address: string,
  network: SupportedNetworks
): Promise<PollTallyVote[]> {
  const addressInfo = await getAddressInfo(address, network);
  const delegateOwnerAddress = addressInfo?.delegateInfo?.address;
  const arbitrumChainId = networkNameToChainId('arbitrum'); //update if we ever add support for arbitrum sepolia
  const [mainnetVotes, arbitrumVotes] = await Promise.all([
    gqlRequest({
    chainId: networkNameToChainId(network),
    query: allMainnetVotes,
    useSubgraph: true,
    variables: { argAddress: address.toLowerCase() }
  }),
    gqlRequest({
      chainId: arbitrumChainId,
      query: allArbitrumVotes,
      useSubgraph: true,
      variables: { argAddress: delegateOwnerAddress ? delegateOwnerAddress.toLowerCase() : address.toLowerCase() }
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
    return {
      pollId: o.poll.id,
      ballot,
      voter: address,
      hash: o.txnHash,
      blockTimestamp: Number(o.blockTime) * 1000,
      mkrSupport: 0, //TODO: fetch mkr support (or remove support for now)
      chainId: o.chainId,
      optionIdRaw: o.choice //TODO update type so this isnt needed
    };
  });
  return res;
}
