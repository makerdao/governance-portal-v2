/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateContractInformation, MKRLockedDelegateAPIResponse } from 'modules/delegates/types';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { delegatesQuerySubsequentPages } from 'modules/gql/queries/subgraph/delegates';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatEther } from 'viem';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const chainId = networkNameToChainId(network);
  const delegates: any[] = [];
  let skip = 0;
  const batchSize = 1000;
  let keepFetching = true;

  while (keepFetching) {
    const data = await gqlRequest<any>({
      chainId,
      useSubgraph: true,
      query: delegatesQuerySubsequentPages,
      variables: {
        skip,
        first: batchSize,
        filter: { version_in: ['1', '2'] }
      }
    });

    const batch = data.delegates;
    delegates.push(...batch);
    skip += batchSize;
    keepFetching = batch.length === batchSize;
  }

  return delegates.map(delegate => {
    const totalDelegated = delegate.delegations.reduce(
      (acc: bigint, curr: { amount: string }) => acc + BigInt(curr.amount),
      0n
    );

    const mkrLockedDelegate: MKRLockedDelegateAPIResponse[] = delegate.delegationHistory.map((x: any) => ({
      delegateContractAddress: x.delegate.id,
      fromAddress: x.delegator,
      immediateCaller: x.delegator,
      lockAmount: formatEther(x.amount),
      blockNumber: x.blockNumber,
      blockTimestamp: new Date(parseInt(x.timestamp, 10) * 1000).toISOString(),
      hash: x.txnHash,
      callerLockTotal: formatEther(x.accumulatedAmount),
      lockTotal: formatEther(x.accumulatedAmount),
      isLockstake: x.isLockstake
    }));

    return {
      address: delegate.ownerAddress,
      voteDelegateAddress: delegate.id,
      mkrDelegated: formatEther(totalDelegated),
      blockTimestamp: delegate.blockTimestamp,
      delegateVersion: delegate.version,
      proposalsSupported: 0,
      mkrLockedDelegate,
      lastVoteDate: null
    };
  });
}
