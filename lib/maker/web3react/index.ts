// TODO move this to its own module
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

export const connectors: Array<[string, AbstractConnector]> = [
  ['MetaMask', new InjectedConnector({ supportedChainIds: [1, 42] })],
  [
    'WalletConnect',
    new WalletConnectConnector({
      rpc: { 1: networkToRpc(SupportedNetworks.MAINNET) },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      pollingInterval: POLLING_INTERVAL
    })
  ],
  [
    'WalletLink',
    new WalletLinkConnector({
      url: networkToRpc(SupportedNetworks.MAINNET),
      appName: 'vote.makerdao.com'
    })
  ]
];
