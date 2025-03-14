/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { vatAbi, vatAddress, vowAddress } from 'modules/contracts/generated';

type SystemSurplusResponse = {
  data?: bigint | undefined;
  loading: boolean;
  error?: Error | null;
};

export const useSystemSurplus = (): SystemSurplusResponse => {
  const chainId = useChainId();

  const { data: dai, error: daiError } = useReadContract({
    address: vatAddress[chainId],
    abi: vatAbi,
    chainId,
    functionName: 'dai',
    args: [vowAddress[chainId]],
    scopeKey: `/system-surplus-dai-${chainId}`
  });

  const { data: sin, error: sinError } = useReadContract({
    address: vatAddress[chainId],
    abi: vatAbi,
    chainId,
    functionName: 'sin',
    args: [vowAddress[chainId]],
    scopeKey: `/system-surplus-sin-${chainId}`
  });

  return {
    data: dai && sin ? dai - sin : undefined,
    loading: !daiError && !sinError && !dai && !sin,
    error: daiError || sinError
  };
};
