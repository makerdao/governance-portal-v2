/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import logger from 'lib/logger';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { delegateHistoryArray } from 'modules/gql/queries/subgraph/delegateHistoryArray';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { MKRLockedDelegateAPIResponse } from '../types';

export async function fetchDelegationEventsByAddresses(
  addresses: string[],
  network: SupportedNetworks
): Promise<MKRLockedDelegateAPIResponse[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      useSubgraph: true,
      query: delegateHistoryArray,
      variables: {
        delegates: addresses
      }
    });
    const flattenedData = data.delegates.flatMap(delegate => delegate.delegationHistory);

    const addressData: MKRLockedDelegateAPIResponse[] = flattenedData.map(x => {
      return {
        delegateContractAddress: x.delegate.id,
        immediateCaller: x.delegator,
        lockAmount: x.amount,
        blockNumber: x.blockNumber,
        blockTimestamp: x.timestamp,
        hash: x.txnHash,
        callerLockTotal: x.accumulatedAmount
      };
    });
    return addressData.filter(x => parseInt(x.lockAmount) !== 0);
  } catch (e) {
    logger.error('fetchDelegationEventsByAddresses: Error fetching delegation events', e.message);
    return [];
  }
}
