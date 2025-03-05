/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { esmAbi, esmAddress } from 'modules/contracts/generated';

type MkrInEsmByAddressResponse = {
  data?: bigint | undefined;
  loading: boolean;
  error?: Error | null;
  mutate: () => void;
};

export const useMkrInEsmByAddress = (address?: string): MkrInEsmByAddressResponse => {
  const chainId = useChainId();

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: esmAddress[chainId],
    abi: esmAbi,
    chainId,
    functionName: 'sum',
    args: [address as `0x${string}`],
    scopeKey: `mkr-in-esm-${address}-${chainId}`,
    query: {
      enabled: !!address
    }
  });

  return {
    data: address ? data : 0n,
    loading: !error && !data,
    error,
    mutate
  };
};
