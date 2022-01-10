import { injectedConnector, walletConnectConnector, walletLinkConnector } from './connectors';
import { SupportedConnectors } from './web3.constants';
import { WalletInfo } from './types/wallets';

export const SUPPORTED_WALLETS: { [connector in SupportedConnectors]: WalletInfo } = {
  [SupportedConnectors.METAMASK]: {
    connector: injectedConnector,
    name: 'MetaMask'
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
