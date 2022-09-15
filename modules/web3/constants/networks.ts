import { config } from 'lib/config';
import { SupportedChain } from '../types/chain';
import { SupportedChainId } from './chainID';

export const NetworkContextName = 'NETWORK';

import {
  MAINNET_SPOCK_URL,
  STAGING_MAINNET_SPOCK_URL,
  GOERLI_SPOCK_URL
  // LOCAL_SPOCK_URL,
} from 'modules/gql/gql.constants';

export enum SupportedConnectors {
  METAMASK = 'MetaMask',
  WALLET_CONNECT = 'WalletConnect',
  COINBASE_WALLET = 'Coinbase Wallet',
  GNOSIS_SAFE = 'Gnosis Safe',
  NETWORK = 'Network'
}

export enum SupportedNetworks {
  MAINNET = 'mainnet',
  GOERLI = 'goerli',
  GOERLIFORK = 'goerlifork',
  ARBITRUMTESTNET = 'arbitrumTestnet',
  ARBITRUM = 'arbitrum'
}

export enum NodeProviders {
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  LOCAL = 'local'
}

type ChainInfo = {
  [key in SupportedChainId]: SupportedChain;
};

//todo: change name to SUPPORTED_CHAIN_INFO
export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.MAINNET]: {
    blockExplorerUrl: 'etherscan.io',
    blockExplorerName: 'Etherscan',
    chainId: SupportedChainId.MAINNET,
    label: 'Mainnet',
    type: 'normal',
    network: SupportedNetworks.MAINNET,
    defaultRpc: NodeProviders.ALCHEMY,
    spockUrl: process.env.NODE_ENV === 'development' ? STAGING_MAINNET_SPOCK_URL : MAINNET_SPOCK_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-mainnet.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
    }
  },
  [SupportedChainId.GOERLI]: {
    blockExplorerUrl: 'goerli.etherscan.io',
    blockExplorerName: 'Etherscan',
    chainId: SupportedChainId.GOERLI,
    label: 'Goerli',
    type: 'normal',
    network: SupportedNetworks.GOERLI,
    defaultRpc: NodeProviders.ALCHEMY,
    spockUrl: GOERLI_SPOCK_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://goerli.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_KEY}`
    }
  },
  [SupportedChainId.GOERLIFORK]: {
    blockExplorerUrl: 'goerli.etherscan.io',
    blockExplorerName: 'Etherscan',
    chainId: SupportedChainId.GOERLIFORK,
    label: 'GoerliFork',
    type: 'normal',
    network: SupportedNetworks.GOERLIFORK,
    defaultRpc: NodeProviders.LOCAL,
    spockUrl: GOERLI_SPOCK_URL,
    rpcs: {
      [NodeProviders.LOCAL]: 'http://localhost:8545'
    }
  },
  [SupportedChainId.ARBITRUMTESTNET]: {
    blockExplorerUrl: 'goerli-rollup-explorer.arbitrum.io',
    blockExplorerName: 'Arbiscan',
    chainId: SupportedChainId.ARBITRUMTESTNET,
    label: 'ArbitrumTestnet',
    type: 'gasless',
    network: SupportedNetworks.ARBITRUMTESTNET,
    defaultRpc: NodeProviders.ALCHEMY,
    rpcs: {
      [NodeProviders.ALCHEMY]: `https://arb-goerli.g.alchemy.com/v2/${config.ALCHEMY_ARBITRUM_TESTNET_KEY}`
    }
  },
  [SupportedChainId.ARBITRUM]: {
    blockExplorerUrl: 'arbiscan.io',
    blockExplorerName: 'Arbiscan',
    chainId: SupportedChainId.ARBITRUM,
    label: 'Arbitrum',
    type: 'gasless',
    network: SupportedNetworks.ARBITRUM,
    defaultRpc: NodeProviders.ALCHEMY,
    rpcs: {
      [NodeProviders.ALCHEMY]: `https://arb-mainnet.g.alchemy.com/v2/${config.ALCHEMY_ARBITRUM_KEY}`
    }
  }
};

export const DEFAULT_NETWORK = CHAIN_INFO[SupportedChainId.MAINNET];

export const ETH_TX_STATE_DIFF_ENDPOINT = (network: SupportedNetworks): string =>
  `https://statediff.ethtx.info/api/decode/state-diffs/${network}`;

/**
 * Hardcoded values for the simulate tx endpoint. We don't need to generate them
 * dynamically because we're only interested in the results of a successful tx.
 */
// const url = 'http://18.157.179.179'; //old
const url = 'http://3.127.236.127';

export const SIMULATE_TX_ENDPOINT = `${url}/api/v1/transactions/simulation/`;

export const SIMULATE_TX_GAS = '0x1c6b9e'; // 1862558 wei

export const SIMULATE_TX_GAS_PRICE = '0x23bd501f00'; // 153500000000 wei or 153.5 Gwei

export const SIGNATURE_CAST = '0x96d373e5'; // Signature for 'cast()'

export const SIMULATE_TX_VALUE = '0';

export const SIMULATE_TX_FROM = '0x5cab1e5286529370880776461c53a0e47d74fb63'; // The chief-keeper EOA, owned by TO, used to cast spells

export const DECODED_SPELL_ENDPOINT = (hash: string): string =>
  `${url}/api/v1/transactions/${hash}/diffs/decoded`;

export const AVG_BLOCKS_PER_DAY = 6500;

export const GASNOW_ENDPOINT = 'https://www.etherchain.org/api/gasnow';
export const GASNOW_URL = 'https://www.etherchain.org/tools/gasnow';
