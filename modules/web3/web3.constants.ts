import { config } from 'lib/config';

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  KOVAN = 42,
  TESTNET = 999
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  id => typeof id === 'number'
) as SupportedChainId[];

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
  [SupportedChainId.MAINNET]: {
    etherscanPrefix: '',
    chainId: 1,
    label: 'Mainnet',
    network: SupportedNetworks.MAINNET
  },
  [SupportedChainId.GOERLI]: {
    etherscanPrefix: 'goerli.',
    chainId: 5,
    label: 'Goerli',
    network: SupportedNetworks.GOERLI
  },
  [SupportedChainId.KOVAN]: {
    etherscanPrefix: 'kovan.',
    chainId: 42,
    label: 'Kovan',
    network: SupportedNetworks.KOVAN
  },
  [SupportedChainId.TESTNET]: {
    //   etherscanPrefix: '',
    chainId: 999, // This is arbitrary and defined in @makerdao/testchain
    label: 'Testnet',
    network: SupportedNetworks.TESTNET
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
    [NodeProviders.INFURA]: `https://goerli.infura.io/v3/${config.INFURA_KEY}`,
    [NodeProviders.ALCHEMY]: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
  },
  [SupportedNetworks.TESTNET]: {
    [NodeProviders.TESTNET]: 'http://localhost:2000'
  }
};
export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;
export const DEFAULT_NODE_PROVIDER = NodeProviders.INFURA;
