/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useChainId } from 'wagmi';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { voteDelegateAbi } from 'modules/contracts/ethers/abis';

type DelegatedByUserResponse = {
  data:
    | {
        directDelegationAmount: bigint | undefined;
        sealDelegationAmount: bigint | undefined;
        totalDelegationAmount: bigint | undefined;
      }
    | undefined;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegatedByUser = (
  userAddress?: string,
  voteDelegateAddress?: string
): DelegatedByUserResponse => {
  const chainId = useChainId();

  if (!voteDelegateAddress) {
    return {
      data: undefined,
      loading: false,
      error: new Error('No account found'),
      mutate: () => undefined
    };
  }

  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async () => {
      if (!userAddress) return undefined;

      const publicClient = getPublicClient(chainId);
      const directDelegated = await publicClient.readContract({
        address: voteDelegateAddress as `0x${string}`,
        abi: voteDelegateAbi,
        functionName: 'stake',
        args: [userAddress as `0x${string}`]
      });
      return {
        directDelegationAmount: directDelegated,
        sealDelegationAmount: undefined,
        totalDelegationAmount: directDelegated
      };
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
