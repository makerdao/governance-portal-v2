/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { useChainId, useReadContract } from 'wagmi';

type HatResponse = {
  data?: string;
  loading: boolean;
  error?: Error | null;
};

export const useHat = (): HatResponse => {
  const chainId = useChainId();

  const { data, error } = useReadContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    chainId,
    functionName: 'hat',
    scopeKey: `executive-hat-${chainId}`
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
