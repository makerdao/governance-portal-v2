// TODO move everything under web3react/ to its own module

import ProviderSubprovider from 'web3-provider-engine/dist/es5/subproviders/provider';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { networkToRpc } from '../network';
import { SupportedNetworks } from '../../constants';

export const Web3ReactPlugin = maker => {
  maker.service('accounts', true).addAccountType('web3-react', ({ library, address }) => {
    const { provider, connector } = library;
    const subprovider = new ProviderSubprovider(provider);
    return { subprovider, address, connector };
  });
};

export const getLibrary = (provider, connector) => ({ provider, connector });

const POLLING_INTERVAL = 12000;

export type ConnectorName = 'MetaMask' | 'WalletConnect' | 'WalletLink' | 'Trezor' | 'Ledger';

export const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 42, 999] });

export const connectors: Array<[ConnectorName, AbstractConnector]> = [
  ['MetaMask', injectedConnector],
  [
    'WalletConnect',
    new WalletConnectConnector({
      rpc: { 1: networkToRpc(SupportedNetworks.MAINNET, 'infura') },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      pollingInterval: POLLING_INTERVAL
    })
  ],
  [
    'WalletLink',
    new WalletLinkConnector({
      url: networkToRpc(SupportedNetworks.MAINNET, 'infura'),
      appName: 'vote.makerdao.com'
    })
  ]
];
