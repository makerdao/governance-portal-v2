/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { DelegateContractInformation } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/subgraph/allDelegates';
import { networkNameToChainId } from 'modules/web3/helpers/chain';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const chainId = networkNameToChainId(network);
  const data = await gqlRequest({
    chainId,
    query: allDelegates
  });

  return data.delegates.map(d => {
    // Ensure blockTimestamp is a valid number
    const blockTimestamp = d.blockTimestamp ? Number(d.blockTimestamp) : 0;
    const totalDelegated = d.delegations.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return {
      blockTimestamp,
      address: d.ownerAddress,
      voteDelegateAddress: d.id,
      skyDelegated: formatValue(BigInt(totalDelegated), 'wad', 18, false),
      lastVoteDate: d.voter?.lastVotedTimestamp ? Number(d.voter.lastVotedTimestamp) : null
    };
  });
}
