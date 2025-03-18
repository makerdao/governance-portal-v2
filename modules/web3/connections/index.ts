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
import { Connection } from '../types/connection';
import { config } from 'lib/config';
import { Wallet } from 'ethers';
import { providers } from 'ethers';
import { CustomizedBridge } from '../connections/CustomizedBridge';
import { EIP1193 } from '@web3-react/eip1193';
import { TEST_ACCOUNTS } from '../../../playwright/shared';
import tenderlyTestnetData from '../../../tenderlyTestnetData.json';

// network
const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      urlMap: {
        [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET),
        [SupportedChainId.TENDERLY]: getRPCFromChainID(SupportedChainId.TENDERLY)
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
        showQrModal: true,
        chains: [SupportedChainId.MAINNET],
        optionalChains: [SupportedChainId.TENDERLY],
        rpcMap: {
          [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET),
          [SupportedChainId.TENDERLY]: getRPCFromChainID(SupportedChainId.TENDERLY)
        },
        optionalMethods: ['eth_signTypedData_v4'],
        metadata: {
          name: 'Maker Governance - Governance Portal',
          description:
            'The MakerDAO Governance Portal allows for anyone to view governance proposals, and also allows for MKR holders to vote',
          url: 'https://vote.makerdao.com',
          icons: ['https://vote.makerdao.com/maker.svg']
        },
        qrModalOptions: {
          themeVariables: {
            // @ts-ignore
            '--w3m-background-color': '#1aab9b',
            '--w3m-accent-color': '#1aab9b',
            '--w3m-logo-image-url': '/assets/maker_logo.svg'
          }
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

//mock connector
let mockConnection: Connection | undefined = undefined;
if (config.USE_MOCK_WALLET && process.env.NODE_ENV !== 'production') {
  const { TENDERLY_RPC_URL } = tenderlyTestnetData;
  const { address, key } = TEST_ACCOUNTS.normal;
  const rpcUrl = TENDERLY_RPC_URL || `https://virtual.mainnet.rpc.tenderly.co/${config.TENDERLY_RPC_KEY}`;
  const provider = new providers.JsonRpcProvider(rpcUrl, SupportedChainId.TENDERLY);
  const signer = new Wallet(key, provider);
  const bridge = new CustomizedBridge(signer, provider);
  bridge.setAddress(address);
  const [web3Injected, web3InjectedHooks] = initializeConnector<EIP1193>(
    actions => new EIP1193({ provider: bridge, actions })
  );
  mockConnection = {
    connector: web3Injected,
    hooks: web3InjectedHooks,
    type: ConnectionType.MOCK
  };
}


export const orderedConnectionTypes = [
  gnosisSafeConnection.type,
  coinbaseWalletConnection.type,
  walletConnectConnection.type,
  metamaskConnection.type,
  networkConnection.type,
  ...(mockConnection ? [mockConnection.type] : [])
];

const CONNECTIONS = [
  gnosisSafeConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  metamaskConnection,
  networkConnection,
  ...(mockConnection ? [mockConnection] : [])
];

export function getConnection(c: Connector | ConnectionType): Connection {
  if (c instanceof Connector) {

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
      case ConnectionType.MOCK:
       return mockConnection || networkConnection;
      default:
        return networkConnection;
    }
  }
}

export function connectorToWalletName(connector: Connector) {
  const connection = CONNECTIONS.find(connection => connection.connector === connector);

  switch (connection?.type) {
    case ConnectionType.METAMASK:
      return SUPPORTED_WALLETS.MetaMask?.name;
    case ConnectionType.COINBASE_WALLET:
      return SUPPORTED_WALLETS['Coinbase Wallet']?.name;
    case ConnectionType.WALLET_CONNECT:
      return SUPPORTED_WALLETS.WalletConnect?.name;
    case ConnectionType.GNOSIS_SAFE:
      return SUPPORTED_WALLETS['Gnosis Safe']?.name;
    case ConnectionType.MOCK:
      return SUPPORTED_WALLETS.Mock?.name;
  }
}
