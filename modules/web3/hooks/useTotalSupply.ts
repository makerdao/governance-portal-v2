/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { TokenName } from 'modules/web3/types/tokens';
import { tokenNameToConfig } from '../helpers/tokenNameToConfig.';
import { useChainId, useReadContract } from 'wagmi';

type UseTotalSupplyResponse = {
  data?: bigint;
  loading: boolean;
  error?: Error | null;
  mutate: () => void;
};

export const useTotalSupply = (token: TokenName): UseTotalSupplyResponse => {
  const tokenConfig = tokenNameToConfig(token);
  const chainId = useChainId();

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: tokenConfig?.address[chainId],
    abi: tokenConfig?.abi,
    chainId,
    functionName: 'totalSupply',
    scopeKey: `${tokenConfig?.address[chainId]}/${token}-total-supply`
  });

  return {
    data: (data as bigint) || undefined,
    loading: !error && !data,
    error,
    mutate
  };
};
