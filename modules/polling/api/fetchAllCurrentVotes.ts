/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { allMainnetVotes } from 'modules/gql/queries/subgraph/allMainnetVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../helpers/parseRawOptionId';
import { PollTallyVote } from '../types';

export async function fetchAllCurrentVotes(
  address: string,
  network: SupportedNetworks
): Promise<PollTallyVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allMainnetVotes,
    useSubgraph: true,
    variables: { argAddress: address.toLowerCase() }
  });

  // Parse the rankedChoice option
  const res: PollTallyVote[] = data.pollVotes.map(o => {
    const ballot = parseRawOptionId(o.choice);
    return {
      pollId: o.poll.id,
      ballot,
      voter: address,
      transactionHash: o.txnHash,
      blockTimestamp: Number(o.blockTime),
      mkrSupport: 0 //TODO: fetch mkr support (or remove support for now)
    };
  });
  return res;
}
