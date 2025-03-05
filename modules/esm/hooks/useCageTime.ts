/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { endAbi, endAddress } from 'modules/contracts/generated';

type CageTimeResponse = {
  data?: bigint;
  loading: boolean;
  error?: Error | null;
};

export const useCageTime = (): CageTimeResponse => {
  const chainId = useChainId();

  const { data, error } = useReadContract({
    address: endAddress[chainId],
    abi: endAbi,
    chainId,
    functionName: 'when',
    scopeKey: `/cage-time-${chainId}`
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
