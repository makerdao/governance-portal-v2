import { config } from 'lib/config';
import { Chain } from '../types/chain';
import { SupportedChainId } from './chainID';

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
    defaultRPC: NodeProviders.INFURA,
    spockURL: MAINNET_SPOCK_URL,
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
    defaultRPC: NodeProviders.INFURA,
    spockURL: GOERLI_SPOCK_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://goerli.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
    }
  },
  [SupportedChainId.GOERLIFORK]: {
    etherscanPrefix: 'goerli.',
    chainId: SupportedChainId.GOERLIFORK,
    label: 'GoerliFork',
    network: SupportedNetworks.GOERLI,
    defaultRPC: NodeProviders.LOCAL,
    spockURL: GOERLI_SPOCK_URL,
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
    defaultRPC: NodeProviders.TESTNET,
    spockURL: LOCAL_SPOCK_URL,

    rpcs: {
      [NodeProviders.TESTNET]: 'http://localhost:2000'
    }
  }
};

export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;

export const ETH_TX_STATE_DIFF_ENDPOINT = (network: SupportedNetworks): string =>
  `https://statediff.ethtx.info/api/decode/state-diffs/${network}`;
