import { WalletInfo } from '../types/wallets';
import { SupportedConnectors } from './networks';

export enum ConnectionType {
  METAMASK = 'METAMASK',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE'
}

// "Network" connector is not a wallet type and must be excluded
export const SUPPORTED_WALLETS: {
  [connector in Exclude<SupportedConnectors, SupportedConnectors.NETWORK>]: WalletInfo;
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

export type WalletName = Exclude<SupportedConnectors, SupportedConnectors.NETWORK>;
