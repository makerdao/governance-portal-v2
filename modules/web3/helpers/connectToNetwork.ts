/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { SupportedChain } from '../types/chain';

export function connectToNetwork(chain: SupportedChain, ethereum: any): Promise<any> {
  const params = {
    chainId: hexStripZeros(BigNumber.from(chain.chainId).toHexString()), // A 0x-prefixed hexadecimal string

    rpcUrls: [chain.rpcs[chain.defaultRpc]]
  };

  return ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [params]
  });
}
