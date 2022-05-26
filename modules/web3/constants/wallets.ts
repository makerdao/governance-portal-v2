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
    name: 'MetaMask'
  },
  [SupportedConnectors.METAMASK_MOBILE]: {
    connector: metamaskMobileConnector,
    name: 'MetaMask Mobile'
  },
  [SupportedConnectors.WALLET_CONNECT]: {
    connector: walletConnectConnector,
    name: 'WalletConnect'
  },
  [SupportedConnectors.COINBASE_WALLET]: {
    connector: walletLinkConnector,
    name: 'Coinbase Wallet'
  }
};
