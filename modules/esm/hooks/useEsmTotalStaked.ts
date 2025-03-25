/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { esmAbi, esmAddress } from 'modules/contracts/generated';

type EsmTotalStakedResponse = {
  data?: bigint | undefined;
  loading: boolean;
  error?: Error | null;
  mutate: () => void;
};

export const useEsmTotalStaked = (): EsmTotalStakedResponse => {
  const chainId = useChainId();

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: esmAddress[chainId],
    abi: esmAbi,
    chainId,
    functionName: 'Sum',
    scopeKey: `/esm-total-staked-${chainId}`
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
