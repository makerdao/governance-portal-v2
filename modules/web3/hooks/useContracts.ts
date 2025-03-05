/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useMemo } from 'react';
import { getContracts } from '../helpers/getContracts';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { SupportedChainId } from '../constants/chainID';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import { EthSdk } from '../types/contracts';
import { providers } from 'ethers';
import { useAccount, useChainId } from 'wagmi';

type Props = {
  chainId?: SupportedChainId;
  provider?: providers.Web3Provider;
  account?: string | null;
};

export const useContracts = (): EthSdk => {
  const { provider }: Props = useWeb3();
  const chainId = useChainId();
  const { address: account } = useAccount();

  const sdk = useMemo(
    () =>
      getContracts(isSupportedChain(chainId) ? chainId : SupportedChainId.MAINNET, provider, account, false),
    [chainId, provider, account]
  );

  return sdk;
};
