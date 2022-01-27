import { config } from 'lib/config';
import { Chain } from '../types/chain';
import { SupportedChainId } from './chainID';

export const NetworkContextName = 'NETWORK';

import {
  MAINNET_SPOCK_URL,
  GOERLI_SPOCK_URL,
  LOCAL_SPOCK_URL,
  // TODO: where to use this?
  STAGING_MAINNET_SPOCK_URL
} from 'modules/gql/gql.constants';

export enum SupportedConnectors {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletConnect',
  COINBASE_WALLET = 'coinbaseWallet'
  // LEDGER = 'ledger',
  // TREZOR = 'trezor'
}
export enum SupportedNetworks {
  MAINNET = 'mainnet',
  GOERLI = 'goerli',
  TESTNET = 'testnet',
  GOERLIFORK = 'goerlifork'
}

export enum NodeProviders {
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  TESTNET = 'testnet',
  LOCAL = 'local'
}

type ChainInfo = {
  [key in SupportedChainId]: Chain;
};

export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.MAINNET]: {
    etherscanPrefix: '',
    chainId: SupportedChainId.MAINNET,
    label: 'Mainnet',
    network: SupportedNetworks.MAINNET,
    defaultRpc: NodeProviders.ALCHEMY,
    spockUrl: process.env.NODE_ENV === 'development' ? STAGING_MAINNET_SPOCK_URL : MAINNET_SPOCK_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-mainnet.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
    }
  },
  [SupportedChainId.GOERLI]: {
    etherscanPrefix: 'goerli.',
    chainId: SupportedChainId.GOERLI,
    label: 'Goerli',
    network: SupportedNetworks.GOERLI,
    defaultRpc: NodeProviders.ALCHEMY,
    spockUrl: GOERLI_SPOCK_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://goerli.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
    }
  },
  [SupportedChainId.GOERLIFORK]: {
    etherscanPrefix: 'goerli.',
    chainId: SupportedChainId.GOERLIFORK,
    label: 'GoerliFork',
    network: SupportedNetworks.GOERLIFORK,
    defaultRpc: NodeProviders.LOCAL,
    spockUrl: GOERLI_SPOCK_URL,
    rpcs: {
      [NodeProviders.LOCAL]: 'http://localhost:8545'
    }
  },
  [SupportedChainId.TESTNET]: {
    //   etherscanPrefix: '',
    chainId: SupportedChainId.TESTNET, // This is arbitrary and defined in @makerdao/testchain
    label: 'Testnet',
    etherscanPrefix: '',
    network: SupportedNetworks.TESTNET,
    defaultRpc: NodeProviders.TESTNET,
    spockUrl: LOCAL_SPOCK_URL,

    rpcs: {
      [NodeProviders.TESTNET]: 'http://localhost:2000'
    }
  }
};

export const DEFAULT_NETWORK = CHAIN_INFO[SupportedChainId.MAINNET];

export const ETH_TX_STATE_DIFF_ENDPOINT = (network: SupportedNetworks): string =>
  `https://statediff.ethtx.info/api/decode/state-diffs/${network}`;
