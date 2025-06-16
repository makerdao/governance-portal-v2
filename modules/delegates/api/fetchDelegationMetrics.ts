/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gqlRequest } from 'modules/gql/gqlRequest';
import { gql } from 'graphql-request';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { formatEther } from 'viem';

interface DelegationMetrics {
  totalMkrDelegated: string;
  delegatorCount: number;
}

export async function fetchDelegationMetrics(network: SupportedNetworks): Promise<DelegationMetrics> {
  try {
    const chainId = networkNameToChainId(network);
    const allDelegations: any[] = [];
    let skip = 0;
    const batchSize = 100; // Smaller batch size for delegates with many delegations
    let keepFetching = true;

    // Fetch delegates in batches
    while (keepFetching) {
      const query = gql`
        query delegatesWithDelegations($skip: Int!, $first: Int!) {
          delegates(where: { version_in: ["1", "2"] }, first: $first, skip: $skip) {
            delegations(first: 1000) {
              delegator
              delegate {
                id
              }
              amount
            }
          }
        }
      `;

      const res = await gqlRequest<any>({
        chainId,
        query,
        useSubgraph: true,
        variables: { skip, first: batchSize }
      });

      const batch = res.delegates;
      allDelegations.push(...batch);
      skip += batchSize;
      keepFetching = batch.length === batchSize;
    }

    const delegations = allDelegations.flatMap(d => d.delegations);
    const totalMkrDelegated = formatEther(delegations.reduce((acc, cur) => acc + BigInt(cur.amount), 0n));
    const uniqueDelegators = new Set(delegations.filter(d => BigInt(d.amount) > 0n).map(d => d.delegator));
    const delegatorCount = uniqueDelegators.size;

    return {
      totalMkrDelegated,
      delegatorCount
    };
  } catch (error) {
    console.error('Error fetching delegation metrics:', error);
    // Return default values when subgraph is unavailable
    return {
      totalMkrDelegated: '0',
      delegatorCount: 0
    };
  }
}
