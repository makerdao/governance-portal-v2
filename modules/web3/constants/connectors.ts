import type { MetaMask } from '@web3-react/metamask';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { Network } from '@web3-react/network';
import { WalletConnect } from '@web3-react/walletconnect';

export type SupportedConnector = MetaMask | Network | GnosisSafe | WalletConnect;
