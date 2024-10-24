/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

//todo: change name to getBlockExplorerLink
export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const chainId = networkNameToChainId(network);
  const prefix = `https://${CHAIN_INFO[chainId].blockExplorerUrl}`;

  switch (type) {
    case 'transaction':
      if (network === SupportedNetworks.TENDERLY) {
        return `${prefix}/tx/mainnet/${data}`;
      }
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}
