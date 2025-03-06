/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { WalletInfo } from '../types/wallets';
import { SupportedChainId } from './chainID';
import { SupportedConnectors } from './networks';
import { config } from 'lib/config';

export enum ConnectionType {
  METAMASK = 'METAMASK',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
  MOCK = 'MOCK'
}

// "Network" connector is not a wallet type and must be excluded
export const SUPPORTED_WALLETS: {
  [connector in Exclude<SupportedConnectors, SupportedConnectors.NETWORK>]?: WalletInfo;
} = {
  [SupportedConnectors.METAMASK]: {
    name: SupportedConnectors.METAMASK,
    connectionType: ConnectionType.METAMASK,
    deeplinkUri: 'https://metamask.app.link/dapp/vote.makerdao.com/'
  },
  [SupportedConnectors.WALLET_CONNECT]: {
    name: SupportedConnectors.WALLET_CONNECT,
    connectionType: ConnectionType.WALLET_CONNECT
  },
  [SupportedConnectors.COINBASE_WALLET]: {
    name: SupportedConnectors.COINBASE_WALLET,
    connectionType: ConnectionType.COINBASE_WALLET
  },
  [SupportedConnectors.GNOSIS_SAFE]: {
    name: SupportedConnectors.GNOSIS_SAFE,
    connectionType: ConnectionType.GNOSIS_SAFE
  }
};

if (config.USE_MOCK_WALLET && process.env.NODE_ENV !== 'production') {
  SUPPORTED_WALLETS[SupportedConnectors.MOCK] = {
    name: SupportedConnectors.MOCK,
    connectionType: ConnectionType.MOCK
  };
}

export type WalletName = Exclude<SupportedConnectors, SupportedConnectors.NETWORK>;

export const SAFE_CONNECTOR_ID = 'safe';

export const SAFE_TRANSACTION_SERVICE_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.ARBITRUM]: 'https://safe-transaction-arbitrum.safe.global',
  [SupportedChainId.TENDERLY]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.ARBITRUMTESTNET]: 'https://safe-transaction-arbitrum.safe.global'
};
