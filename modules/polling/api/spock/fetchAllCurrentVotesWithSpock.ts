/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { allCurrentVotes } from 'modules/gql/queries/allCurrentVotes';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { parseRawOptionId } from '../../helpers/parseRawOptionId';
import { PollTallyVote } from '../../types';

export async function fetchAllCurrentVotesWithSpock(
  address: string,
  network: SupportedNetworks,
  endUnix: number
): Promise<PollTallyVote[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allCurrentVotes,
    variables: { argAddress: address.toLowerCase() }
  });
  // Parse the rankedChoice option and filter out votes after endUnix
  const res: PollTallyVote[] = data.allCurrentVotes.nodes
    .filter(o => {
      const voteTimestamp = Math.floor(new Date(o.blockTimestamp).getTime() / 1000);
      return voteTimestamp <= endUnix;
    })
    .map(o => {
      const ballot = parseRawOptionId(o.optionIdRaw);
      return {
        pollId: o.pollId,
        voter: address,
        mkrSupport: Number(o.mkrSupport),
        ballot,
        hash: o.hash,
        blockTimestamp: new Date(o.blockTimestamp).getTime(),
        chainId: o.chainId
      };
    });

  return res;
}
