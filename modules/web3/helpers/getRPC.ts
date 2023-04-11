/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedChainId } from 'modules/web3/constants/chainID';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

export function getRPCFromChainID(chainId: SupportedChainId, provider?: string): string {
  const chain = CHAIN_INFO[chainId];

  const defaultProvider = chain.defaultRpc;

  return provider ? chain.rpcs[provider] : chain.rpcs[defaultProvider];
}
