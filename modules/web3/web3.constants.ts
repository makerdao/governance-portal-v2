import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector, WalletConnectConnectorArguments } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { config } from 'lib/config';
// import { ConnectorName } from 'lib/web3react';

const POLLING_INTERVAL = 12000;

export enum SupportedConnectors {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletConnect',
  COINBASE_WALLET = 'coinbaseWallet'
  // LEDGER = 'ledger',
  // TREZOR = 'trezor'
}
export enum SupportedNetworks {
  MAINNET = 'mainnet',
  KOVAN = 'kovan',
  GOERLI = 'goerli',
  TESTNET = 'testnet'
}

export enum NodeProviders {
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  TESTNET = 'testnet'
}

export const CHAIN_INFO = {
  [SupportedNetworks.MAINNET]: {
    etherscanPrefix: '',
    chainId: 1,
    label: 'Mainnet'
  },
  [SupportedNetworks.GOERLI]: {
    etherscanPrefix: 'goerli.',
    chainId: 5,
    label: 'Goerli'
  },
  [SupportedNetworks.KOVAN]: {
    etherscanPrefix: 'kovan.',
    chainId: 42,
    label: 'Kovan'
  },
  [SupportedNetworks.TESTNET]: {
    //   etherscanPrefix: '',
    chainId: 999, // This is arbitrary and defined in @makerdao/testchain
    label: 'Testnet'
  }
};

//TODO maybe just add this to chain info
export const CMS_ENDPOINTS = {
  [SupportedNetworks.MAINNET]: {
    allTopics: 'https://cms-gov.makerfoundation.com/content/governance-dashboard',
    allSpells: 'https://cms-gov.makerfoundation.com/content/all-spells'
  },
  [SupportedNetworks.KOVAN]: {
    allTopics: 'https://elb.cms-gov.makerfoundation.com:444/content/governance-dashboard',
    allSpells: 'https://elb.cms-gov.makerfoundation.com:444/content/all-spells'
  }
  // no goerli CMS endpoints
};

export const NETWORK_URLS = {
  [SupportedNetworks.MAINNET]: {
    [NodeProviders.INFURA]: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
    [NodeProviders.ALCHEMY]: `https://eth-mainnet.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
  },
  [SupportedNetworks.KOVAN]: {
    [NodeProviders.INFURA]: `https://kovan.infura.io/v3/${config.INFURA_KEY}`,
    [NodeProviders.ALCHEMY]: `https://eth-kovan.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
  },
  [SupportedNetworks.GOERLI]: {
    [NodeProviders.ALCHEMY]: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
  },
  [SupportedNetworks.TESTNET]: {
    [NodeProviders.TESTNET]: 'http://localhost:2000'
  }
};
export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;
export const DEFAULT_NODE_PROVIDER = NodeProviders.INFURA;

export const networkToRpc = (
  network: string = DEFAULT_NETWORK,
  nodeProvider: string = DEFAULT_NODE_PROVIDER
): string => NETWORK_URLS[network][nodeProvider];

export const chainIdToNetworkName = (chainId: number): SupportedNetworks => {
  for (const chain in CHAIN_INFO) {
    if (CHAIN_INFO[chain].chainId === chainId) {
      return chain as SupportedNetworks;
    }
  }
  throw new Error(`Unsupported chain id ${chainId}`);
};
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    CHAIN_INFO[SupportedNetworks.MAINNET].chainId,
    CHAIN_INFO[SupportedNetworks.GOERLI].chainId,
    CHAIN_INFO[SupportedNetworks.KOVAN].chainId,
    CHAIN_INFO[SupportedNetworks.TESTNET].chainId
  ]
});

export const walletConnectConnector = new WalletConnectConnector({
  rpc: { 1: networkToRpc(SupportedNetworks.MAINNET, NodeProviders.INFURA) },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
} as WalletConnectConnectorArguments);

export const walletLinkConnector = new WalletLinkConnector({
  url: networkToRpc(SupportedNetworks.MAINNET, 'infura'),
  appName: 'vote.makerdao.com'
});

/**Wallets */
export type ConnectorName = 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet';
//| 'Trezor' | 'Ledger';

interface WalletInfo {
  connector: AbstractConnector;
  name: ConnectorName;
}

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
