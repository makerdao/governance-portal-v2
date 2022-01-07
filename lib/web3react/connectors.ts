import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector, WalletConnectConnectorArguments } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { networkToRpc } from '../maker/network';
import { SupportedNetworks } from '../constants';

const POLLING_INTERVAL = 12000;

export type ConnectorName = 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet' | 'Trezor' | 'Ledger';

export const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 5, 42, 999] });

export const connectors: Array<[ConnectorName, AbstractConnector]> = [
  ['MetaMask', injectedConnector],
  [
    'WalletConnect',
    new WalletConnectConnector({
      rpc: { 1: networkToRpc(SupportedNetworks.MAINNET, 'infura') },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      pollingInterval: POLLING_INTERVAL
    } as WalletConnectConnectorArguments)
  ],
  [
    'Coinbase Wallet',
    new WalletLinkConnector({
      url: networkToRpc(SupportedNetworks.MAINNET, 'infura'),
      appName: 'vote.makerdao.com'
    })
  ]
];
