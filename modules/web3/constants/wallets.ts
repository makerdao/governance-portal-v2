import {
  injectedConnection,
  walletConnectConnection,
  coinbaseWalletConnection,
  gnosisSafeConnection
} from 'modules/web3/connections';
import { WalletInfo } from '../types/wallets';
import { SupportedConnectors } from './networks';

export const SUPPORTED_WALLETS: { [connector in SupportedConnectors]: WalletInfo } = {
  [SupportedConnectors.METAMASK]: {
    connection: injectedConnection,
    name: 'MetaMask',
    deeplinkUri: 'https://metamask.app.link/dapp/vote.makerdao.com/'
  },
  [SupportedConnectors.WALLET_CONNECT]: {
    connection: walletConnectConnection,
    name: 'WalletConnect'
  },
  [SupportedConnectors.COINBASE_WALLET]: {
    connection: coinbaseWalletConnection,
    name: 'Coinbase Wallet'
  },
  [SupportedConnectors.GNOSIS_SAFE]: {
    connection: gnosisSafeConnection,
    name: 'Gnosis Safe'
  }
};
