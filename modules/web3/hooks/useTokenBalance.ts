/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useAccount, useChainId, useReadContract } from 'wagmi';
import { TokenName } from 'modules/web3/types/tokens';
import { tokenNameToConfig } from '../helpers/tokenNameToConfig.';

type UseTokenBalanceResponse = {
  data?: bigint | undefined;
  loading: boolean;
  error?: Error | null;
  mutate: () => void;
};

// takes optional address argument in case we are fetching a balance
// other than for a connected account
// if no address passed, assume we want connected account balance
export const useTokenBalance = (token: TokenName, address?: string): UseTokenBalanceResponse => {
  const { address: connectedAddress } = useAccount();
  const account = address || connectedAddress;

  const chainId = useChainId();
  const tokenConfig = tokenNameToConfig(token);

  const {
    data,
    error,
    refetch: mutate
  } = useReadContract({
    address: tokenConfig?.address[chainId],
    abi: tokenConfig?.abi,
    chainId,
    functionName: 'balanceOf',
    args: [account as `0x${string}`],
    scopeKey: `${tokenConfig?.address[chainId]}/${token}-balance-${account}-${chainId}`,
    query: {
      enabled: !!account
    }
  });

  return {
    data: data as bigint | undefined,
    loading: !error && !data,
    error,
    mutate
  };
};
