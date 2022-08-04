import {
  injectedConnection,
  walletConnectConnection,
  coinbaseWalletConnection,
  gnosisSafeConnection
} from 'modules/web3/connections';
import { WalletInfo } from '../types/wallets';
import { SupportedConnectors } from './networks';

// "Network" connector is not a wallet type and must be excluded
export const SUPPORTED_WALLETS: {
  [connector in Exclude<SupportedConnectors, SupportedConnectors.NETWORK>]: WalletInfo;
} = {
  [SupportedConnectors.METAMASK]: {
    connection: injectedConnection,
    name: SupportedConnectors.METAMASK,
    deeplinkUri: 'https://metamask.app.link/dapp/vote.makerdao.com/'
  },
  [SupportedConnectors.WALLET_CONNECT]: {
    connection: walletConnectConnection,
    name: SupportedConnectors.WALLET_CONNECT
  },
  [SupportedConnectors.COINBASE_WALLET]: {
    connection: coinbaseWalletConnection,
    name: SupportedConnectors.COINBASE_WALLET
  },
  [SupportedConnectors.GNOSIS_SAFE]: {
    connection: gnosisSafeConnection,
    name: SupportedConnectors.GNOSIS_SAFE
  }
};

export type WalletName = Exclude<SupportedConnectors, SupportedConnectors.NETWORK>;
