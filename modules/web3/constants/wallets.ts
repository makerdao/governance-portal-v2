import {
  injectedConnector,
  metamaskMobileConnector,
  walletConnectConnector,
  walletLinkConnector
} from '../connectors';
import { WalletInfo } from '../types/wallets';
import { SupportedConnectors } from './networks';

export const SUPPORTED_WALLETS: { [connector in SupportedConnectors]: WalletInfo } = {
  [SupportedConnectors.METAMASK]: {
    connector: injectedConnector,
    name: 'MetaMask',
    mobile: false
  },
  // [SupportedConnectors.METAMASK_MOBILE]: {
  //   connector: metamaskMobileConnector,
  //   name: 'MetaMask Mobile',
  //   mobile: true
  // },
  [SupportedConnectors.WALLET_CONNECT]: {
    connector: walletConnectConnector,
    name: 'WalletConnect',
    mobile: true
  },
  [SupportedConnectors.COINBASE_WALLET]: {
    connector: walletLinkConnector,
    name: 'Coinbase Wallet',
    mobile: true
  }
};
