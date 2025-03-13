/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedChainId } from './chainID';

export const SAFE_CONNECTOR_ID = 'safe';

export const SAFE_TRANSACTION_SERVICE_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.ARBITRUM]: 'https://safe-transaction-arbitrum.safe.global',
  [SupportedChainId.TENDERLY]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.ARBITRUMTESTNET]: 'https://safe-transaction-arbitrum.safe.global'
};
