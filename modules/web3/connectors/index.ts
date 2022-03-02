import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector, WalletConnectConnectorArguments } from '@web3-react/walletconnect-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from '../helpers/getRPC';
import { CHAIN_INFO } from 'modules/web3/constants/networks';
import { NodeProviders } from 'modules/web3/constants/networks';

const POLLING_INTERVAL = 12000;

export const networkConnector = new NetworkConnector({
  urls: { 1: CHAIN_INFO[1].rpcs[NodeProviders.INFURA] }
});

export const injectedConnector = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS
});

const rpcs = ALL_SUPPORTED_CHAIN_IDS.reduce((acc, cur) => {
  acc[cur] = getRPCFromChainID(cur);
  return acc;
}, {});

export const walletConnectConnector = new WalletConnectConnector({
  rpc: rpcs,
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
} as WalletConnectConnectorArguments);

export const walletLinkConnector = new WalletLinkConnector({
  // this is just a fallback, will default to rpc provider that coinbase wallet provides
  url: getRPCFromChainID(SupportedChainId.MAINNET),
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  appName: 'vote.makerdao.com'
});
