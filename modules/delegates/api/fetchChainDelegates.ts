/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { DelegateContractInformation } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { Query } from 'modules/gql/generated/graphql';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const chainId = networkNameToChainId(network);
  const data = await gqlRequest<Query>({ chainId, query: allDelegates });

  const delegates = data.allDelegates.nodes;

  const publicClient = getPublicClient(chainId);

  const delegatesWithMkrStaked: DelegateContractInformation[] = await Promise.all(
    delegates.map(async (delegate): Promise<DelegateContractInformation> => {
      if (delegate?.voteDelegate && delegate.delegate) {
        // Get MKR delegated to each contract
        const mkr = await publicClient.readContract({
          address: chiefAddress[chainId],
          abi: chiefAbi,
          functionName: 'deposits',
          args: [delegate.voteDelegate as `0x${string}`]
        });

        const chainDelegate: DelegateContractInformation = {
          ...(delegate as DelegateContractInformation),
          address: delegate.delegate,
          voteDelegateAddress: delegate.voteDelegate,
          mkrDelegated: formatValue(mkr, 'wad', 18, false)
        };

        return chainDelegate;
      }
      return delegate as DelegateContractInformation;
    })
  );

  return delegatesWithMkrStaked;
}
