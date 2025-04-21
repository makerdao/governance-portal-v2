/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { skyAbi, skyAddress } from 'modules/contracts/generated'; // Assuming these exist

type SkyBalanceResponse = {
  data?: bigint;
  loading?: boolean;
  error?: Error | null;
  mutate: () => void;
};

export const useSkyBalance = (address?: string): SkyBalanceResponse => {
  const chainId = useChainId();

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: skyAddress[chainId], // Using SKY address
    abi: skyAbi, // Using SKY ABI
    chainId,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    scopeKey: `/sky-balance-${address}-${chainId}`, // Updated scopeKey
    query: {
      enabled: !!address,
      refetchOnMount: true
    }
  });

  return {
    data: data,
    loading: !error && !data,
    error,
    mutate
  };
};
