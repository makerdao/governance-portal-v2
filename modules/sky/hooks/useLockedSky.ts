/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

type LockedSkyData = {
  data?: bigint;
  loading: boolean;
  error: Error | null;
  mutate: () => void;
};

export const useLockedSky = (address?: string): LockedSkyData => {
  const chainId = useChainId();

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    chainId,
    functionName: 'deposits',
    args: [address as `0x${string}`],
    scopeKey: `${chiefAddress[chainId]}/sky-locked-${address}`,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
