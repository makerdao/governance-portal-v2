/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useChainId } from 'wagmi';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';

export function useNetwork() {
  const chainId = useChainId();
  const network = chainIdToNetworkName(chainId);

  return network;
}
