import type { MetaMask } from '@web3-react/metamask';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { Network } from '@web3-react/network';
import { WalletConnect } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';

export type SupportedConnector = MetaMask | Network | GnosisSafe | WalletConnect | CoinbaseWallet;

export enum AccessType {
  READ_ONLY = 'readOnly',
  WRITE = 'write'
}
