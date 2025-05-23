/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { formatEther, parseEther } from 'viem';
import logger from 'lib/logger';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/subgraph/allDelegates';
import { delegatorHistory } from 'modules/gql/queries/subgraph/delegatorHistory';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { DelegationHistory, SKYDelegatedToResponse } from '../types';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  try {
    // TODO: This information could be aggregated in the "mkrDelegatedTo" query in gov-polling-db, and returned there, as an improvement.
    const chainId = networkNameToChainId(network);
    const delegatesData = await gqlRequest({
      chainId,
      query: allDelegates
    });
    const delegates = delegatesData.delegates;

    // Returns the records with the aggregated delegated data
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: delegatorHistory,
      variables: { address: address.toLowerCase() }
    });
    const res: SKYDelegatedToResponse[] = data.delegationHistories.map(x => {
      return {
        delegateContractAddress: x.delegate.id,
        lockAmount: x.amount,
        blockTimestamp: new Date(parseInt(x.timestamp) * 1000).toISOString(),
        hash: x.txnHash,
        blockNumber: x.blockNumber,
        immediateCaller: address,
        isStakingEngine: x.isStakingEngine
      };
    });

    const delegatedTo = res.reduce(
      (acc, { delegateContractAddress, lockAmount, blockTimestamp, hash, isStakingEngine }) => {
        const existing = acc.find(({ address }) => address === delegateContractAddress) as
          | DelegationHistory
          | undefined;

        // We sum the total of lockAmounts in different events to calculate the current delegated amount
        if (existing) {
          existing.lockAmount = formatEther(parseEther(existing.lockAmount) + parseEther(lockAmount));
          existing.events.push({
            lockAmount: formatEther(parseEther(lockAmount)),
            blockTimestamp,
            hash,
            isStakingEngine
          });
        } else {
          const delegatingTo = delegates.find(
            i => i?.id?.toLowerCase() === delegateContractAddress.toLowerCase()
          );

          if (!delegatingTo) {
            return acc;
          }

          acc.push({
            address: delegateContractAddress,
            lockAmount: formatEther(parseEther(lockAmount)),
            events: [
              { lockAmount: formatEther(parseEther(lockAmount)), blockTimestamp, hash, isStakingEngine }
            ]
          } as DelegationHistory);
        }

        return acc;
      },
      [] as DelegationHistory[]
    );

    // Sort by lockAmount, lockAmount is the total amount delegated currently
    return delegatedTo.sort((prev, next) =>
      parseEther(prev.lockAmount) > parseEther(next.lockAmount) ? -1 : 1
    );
  } catch (e) {
    logger.error('fetchDelegatedTo: Error fetching SKY delegated to address', e.message);
    return [];
  }
}
