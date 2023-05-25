/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { initializeConnector } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { Network } from '@web3-react/network';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { GnosisSafe } from '@makerdao-dux/gnosis-safe';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { SUPPORTED_WALLETS, ConnectionType } from '../constants/wallets';
import { Connection, EIP1193Provider } from '../types/connection';
import { config } from 'lib/config';

// network
const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      urlMap: {
        [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET),
        [SupportedChainId.GOERLI]: getRPCFromChainID(SupportedChainId.GOERLI),
        [SupportedChainId.GOERLIFORK]: getRPCFromChainID(SupportedChainId.GOERLIFORK)
      },
      defaultChainId: 1
    })
);
export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK
};

// metamask
const [metamask, metamaskHooks] = initializeConnector<MetaMask>(actions => new MetaMask({ actions }));
export const metamaskConnection: Connection = {
  connector: metamask,
  hooks: metamaskHooks,
  type: ConnectionType.METAMASK
};

// walletconnect
const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<WalletConnect>(
  actions =>
    new WalletConnect({
      actions,
      options: {
        projectId: config.WALLETCONNECT_PROJECT_ID,
        chains: [SupportedChainId.MAINNET, SupportedChainId.GOERLI],
        disableProviderPing: true,
        rpcMap: {
          [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET),
          [SupportedChainId.GOERLI]: getRPCFromChainID(SupportedChainId.GOERLI)
        },
        showQrModal: true,
        qrModalOptions: {
          themeVariables: {
            '--w3m-background-color': '#1aab9b',
            '--w3m-accent-color': '#1aab9b',
            '--w3m-logo-image-url': '/assets/maker_logo.svg'
          }
        },
        metadata: {
          name: 'Maker Governance - Governance Portal',
          description:
            'The MakerDAO Governance Portal allows for anyone to view governance proposals, and also allows for MKR holders to vote',
          url: 'https://vote.makerdao.com',
          icons: ['https://vote.makerdao.com/maker.svg']
        }
      }
    })
);
export const walletConnectConnection: Connection = {
  connector: web3WalletConnect,
  hooks: web3WalletConnectHooks,
  type: ConnectionType.WALLET_CONNECT
};

// coinbase wallet
const [web3CoinbaseWallet, web3CoinbaseWalletHooks] = initializeConnector<any>(
  actions =>
    new CoinbaseWallet({
      actions,
      options: {
        url: getRPCFromChainID(SupportedChainId.MAINNET),
        appName: 'vote.makerdao.com',
        reloadOnDisconnect: false
      }
    })
);
export const coinbaseWalletConnection: Connection = {
  connector: web3CoinbaseWallet as any,
  hooks: web3CoinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET
};

// gnosis safe
const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<any>(
  actions => new GnosisSafe({ actions })
);
export const gnosisSafeConnection: Connection = {
  connector: web3GnosisSafe as any,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE
};

export const orderedConnectionTypes = [
  gnosisSafeConnection.type,
  coinbaseWalletConnection.type,
  walletConnectConnection.type,
  metamaskConnection.type,
  networkConnection.type
];

const CONNECTIONS = [
  gnosisSafeConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  metamaskConnection,
  networkConnection
];

export function getConnection(c: Connector | ConnectionType): Connection {
  if (c instanceof Connector) {
    // Return the shimmed metamask connection if on goerlifork
    if ((c.provider as EIP1193Provider)?.chainId === SupportedChainId.GOERLIFORK) {
      return metamaskConnection;
    }

    const connection = CONNECTIONS.find(connection => connection.connector === c);
    if (!connection) {
      throw Error('unsupported connector');
    }
    return connection;
  } else {
    switch (c) {
      case ConnectionType.METAMASK:
        return metamaskConnection;
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection;
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection;
      case ConnectionType.NETWORK:
        return networkConnection;
      case ConnectionType.GNOSIS_SAFE:
        return gnosisSafeConnection;
      default:
        return networkConnection;
    }
  }
}

export function connectorToWalletName(connector: Connector) {
  const connection = CONNECTIONS.find(connection => connection.connector === connector);

  switch (connection?.type) {
    case ConnectionType.METAMASK:
      return SUPPORTED_WALLETS.MetaMask.name;
    case ConnectionType.COINBASE_WALLET:
      return SUPPORTED_WALLETS['Coinbase Wallet'].name;
    case ConnectionType.WALLET_CONNECT:
      return SUPPORTED_WALLETS.WalletConnect.name;
    case ConnectionType.GNOSIS_SAFE:
      return SUPPORTED_WALLETS['Gnosis Safe'].name;
  }
}
