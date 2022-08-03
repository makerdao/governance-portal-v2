import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { Network } from '@web3-react/network';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { SupportedChainId } from 'modules/web3/constants/chainID';

export interface Connection {
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
}

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE'
}

// network
const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      // TODO update for all chains
      urlMap: { [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET) },
      defaultChainId: 1
    })
);
export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK
};

// metamask
const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(actions => new MetaMask({ actions }));
export const injectedConnection: Connection = {
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED
};

// walletconnect
const [web3WalletConnect, web3WalletConnectHooks] = initializeConnector<any>(
  actions =>
    new WalletConnect({
      actions,
      options: {
        // TODO update for all chains
        rpc: { [SupportedChainId.MAINNET]: getRPCFromChainID(SupportedChainId.MAINNET) },
        qrcode: true
      }
    })
);
export const walletConnectConnection: Connection = {
  connector: web3WalletConnect as any,
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
