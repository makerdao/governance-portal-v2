/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { endAbi, endAddress } from 'modules/contracts/generated';

type EsmIsActiveResponse = {
  data?: boolean;
  loading: boolean;
  error?: Error | null;
};

export const useEsmIsActive = (): EsmIsActiveResponse => {
  const chainId = useChainId();

  // returns 0 if active, otherwise returns 1
  const { data, error } = useReadContract({
    address: endAddress[chainId],
    abi: endAbi,
    chainId,
    functionName: 'live',
    scopeKey: `/esm-is-active-${chainId}`
  });

  return {
    data: data !== 1n,
    loading: !error && !data,
    error
  };
};
