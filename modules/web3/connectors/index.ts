import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector, WalletConnectConnectorArguments } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from '../helpers/getRPC';

const POLLING_INTERVAL = 12000;

export const injectedConnector = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS
});

export const walletConnectConnector = new WalletConnectConnector({
  rpc: { 1: getRPCFromChainID(SupportedChainId.MAINNET) },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
} as WalletConnectConnectorArguments);

export const walletLinkConnector = new WalletLinkConnector({
  url: getRPCFromChainID(SupportedChainId.MAINNET),
  appName: 'vote.makerdao.com'
});
