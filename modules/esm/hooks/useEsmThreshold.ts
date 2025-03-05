/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { esmAbi, esmAddress } from 'modules/contracts/generated';

type EsmThresholdResponse = {
  data?: bigint;
  loading: boolean;
  error?: Error | null;
};

export const useEsmThreshold = (): EsmThresholdResponse => {
  const chainId = useChainId();

  const { data, error } = useReadContract({
    address: esmAddress[chainId],
    abi: esmAbi,
    chainId,
    functionName: 'min',
    scopeKey: `/esm-threshold-${chainId}`
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
