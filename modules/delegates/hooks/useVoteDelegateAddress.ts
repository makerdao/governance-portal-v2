/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { useChainId, useReadContract } from 'wagmi';
import { voteDelegateFactoryAbi, voteDelegateFactoryAddress } from 'modules/contracts/generated';

type VoteDelegateAddressResponse = {
  data?: `0x${string}` | undefined;
  loading: boolean;
  error: Error | null;
  mutate: () => void;
};

// Returns the vote delegate contract address for a account
export const useVoteDelegateAddress = (account?: `0x${string}`): VoteDelegateAddressResponse => {
  const chainId = useChainId();

  const { data, isLoading, error, refetch } = useReadContract({
    address: voteDelegateFactoryAddress[chainId],
    abi: voteDelegateFactoryAbi,
    chainId,
    functionName: 'delegates',
    args: [account as `0x${string}`],
    scopeKey: `${account}/vote-delegate-address`,
    query: {
      enabled: !!account
    }
  });

  return {
    data: data !== ZERO_ADDRESS ? data : undefined,
    loading: isLoading,
    error,
    mutate: () => {
      refetch();
    }
  };
};
