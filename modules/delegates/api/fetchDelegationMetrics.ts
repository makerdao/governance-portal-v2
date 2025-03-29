/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegations } from 'modules/gql/queries/subgraph/allDelegations';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { formatEther } from 'viem';

interface DelegationMetrics {
  totalMkrDelegated: number;
  delegatorCount: number;
}

export async function fetchDelegationMetrics(network: SupportedNetworks): Promise<DelegationMetrics> {
  const res = await gqlRequest<any>({
    chainId: networkNameToChainId(network),
    useSubgraph: true,
    query: allDelegations
  });
  const delegations = res.delegations;
  const totalMkrDelegated = Number(
    formatEther(delegations.reduce((acc, cur) => acc + BigInt(cur.amount), 0n))
  );
  const delegatorCount = delegations.filter(d => Number(d.amount) > 0).length;

  return {
    totalMkrDelegated,
    delegatorCount
  };
}
