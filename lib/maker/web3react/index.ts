// TODO move everything under web3react/ to its own module

import ProviderSubprovider from 'web3-provider-engine/dist/es5/subproviders/provider';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector, WalletConnectConnectorArguments } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { SupportedChainId } from 'modules/web3/constants/chainID';

export const Web3ReactPlugin = maker => {
  maker.service('accounts', true).addAccountType('web3-react', ({ library, address }) => {
    const { provider, connector } = library;
    const subprovider = new ProviderSubprovider(provider);
    return { subprovider, address, connector };
  });
};

export const getLibrary = (provider, connector) => ({ provider, connector });

const POLLING_INTERVAL = 12000;

export type ConnectorName = 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet' | 'Trezor' | 'Ledger';

// Add 31337 for the localhost:8545 goerli fork
export const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 5, 42, 999, 1337, 31337] });

export const connectors: Array<[ConnectorName, AbstractConnector]> = [
  ['MetaMask', injectedConnector],
  [
    'WalletConnect',
    new WalletConnectConnector({
      rpc: { 1: getRPCFromChainID(SupportedChainId.MAINNET) },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      pollingInterval: POLLING_INTERVAL
    } as WalletConnectConnectorArguments)
  ],
  [
    'Coinbase Wallet',
    new WalletLinkConnector({
      url: getRPCFromChainID(SupportedChainId.MAINNET),
      appName: 'vote.makerdao.com'
    })
  ]
];
