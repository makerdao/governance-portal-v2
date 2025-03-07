/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId, useReadContract } from 'wagmi';
import { TokenName } from '../types/tokens';
import { tokenNameToConfig } from '../helpers/tokenNameToConfig';

type TokenAllowanceResponse = {
  data?: boolean;
  loading: boolean;
  error?: Error | null;
  mutate: () => void;
};

// Checks if the user allowed the spending of a token and contract address
export const useTokenAllowance = (
  name: TokenName,
  amount: bigint,
  userAddress?: string,
  contractAddress?: string
): TokenAllowanceResponse => {
  const chainId = useChainId();
  const tokenConfig = tokenNameToConfig(name);

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: tokenConfig?.address[chainId],
    abi: tokenConfig?.abi,
    chainId,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, contractAddress as `0x${string}`],
    scopeKey: `token-allowance-${name}-${userAddress}-${contractAddress}-${chainId}`,
    query: {
      enabled: !!userAddress && !!contractAddress
    }
  });

  return {
    data: data ? (data as bigint) > amount : undefined,
    loading: !error && !data,
    error,
    mutate
  };
};
