/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { config } from 'lib/config';
import { SupportedChain } from '../types/chain';
import { SupportedChainId } from './chainID';
import tenderlyTestnetData from '../../../tenderlyTestnetData.json';

import {
  TENDERLY_SUBGRAPH_URL,
  MAINNET_STAGING_SUBGRAPH_URL,
  MAINNET_PROD_SUBGRAPH_URL,
  ARBITRUM_PROD_SUBGRAPH_URL,
  ARBITRUM_STAGING_SUBGRAPH_URL,
  ARBITRUM_TENDERLY_SUBGRAPH_URL
} from 'modules/gql/gql.constants';

export enum SupportedConnectors {
  METAMASK = 'MetaMask',
  WALLET_CONNECT = 'WalletConnect',
  COINBASE_WALLET = 'Coinbase Wallet',
  GNOSIS_SAFE = 'Gnosis Safe',
  NETWORK = 'Network',
  MOCK = 'Mock'
}

export enum SupportedNetworks {
  MAINNET = 'mainnet',
  ARBITRUMTESTNET = 'sepolia',
  ARBITRUM = 'arbitrum',
  TENDERLY = 'tenderly'
}

export enum NodeProviders {
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  LOCAL = 'local',
  TENDERLY = 'tenderly'
}

type ChainInfo = {
  [key in SupportedChainId]: SupportedChain;
};

const { TENDERLY_RPC_URL } = tenderlyTestnetData;
const TENDERLY_CONTAINER_ID = 'c8bf3399-e510-4836-9ab1-4112e8b93aad';

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
    subgraphUrl:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
        ? MAINNET_STAGING_SUBGRAPH_URL
        : MAINNET_PROD_SUBGRAPH_URL,
    rpcs: {
      [NodeProviders.INFURA]: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
      [NodeProviders.ALCHEMY]: `https://eth-mainnet.g.alchemy.com/v2/${config.ALCHEMY_KEY}`
    },
    showInProduction: true
  },
  [SupportedChainId.ARBITRUMTESTNET]: {
    blockExplorerUrl: 'sepolia.arbiscan.io',
    blockExplorerName: 'Arbiscan',
    chainId: SupportedChainId.ARBITRUMTESTNET,
    label: 'ArbitrumTestnet',
    type: 'gasless',
    network: SupportedNetworks.ARBITRUMTESTNET,
    defaultRpc: NodeProviders.ALCHEMY,
    subgraphUrl: ARBITRUM_TENDERLY_SUBGRAPH_URL,
    rpcs: {
      [NodeProviders.ALCHEMY]: `https://arb-sepolia.g.alchemy.com/v2/${config.ALCHEMY_ARBITRUM_TESTNET_KEY}`
    },
    showInProduction: false
  },
  [SupportedChainId.ARBITRUM]: {
    blockExplorerUrl: 'arbiscan.io',
    blockExplorerName: 'Arbiscan',
    chainId: SupportedChainId.ARBITRUM,
    label: 'Arbitrum',
    type: 'gasless',
    network: SupportedNetworks.ARBITRUM,
    defaultRpc: NodeProviders.ALCHEMY,
    subgraphUrl:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
      ? ARBITRUM_STAGING_SUBGRAPH_URL
      : ARBITRUM_PROD_SUBGRAPH_URL,
    rpcs: {
      [NodeProviders.ALCHEMY]: `https://arb-mainnet.g.alchemy.com/v2/${config.ALCHEMY_ARBITRUM_KEY}`
    },
    showInProduction: false
  },
  [SupportedChainId.TENDERLY]: {
    blockExplorerUrl: `dashboard.tenderly.co/pullup-labs/endgame-0/testnet/${TENDERLY_CONTAINER_ID}`,
    blockExplorerName: 'Etherscan',
    chainId: SupportedChainId.TENDERLY,
    label: 'Tenderly',
    type: 'normal',
    network: SupportedNetworks.TENDERLY,
    defaultRpc: NodeProviders.TENDERLY,
    subgraphUrl: TENDERLY_SUBGRAPH_URL,
    rpcs: {
      [NodeProviders.TENDERLY]:
        config.USE_MOCK_WALLET && TENDERLY_RPC_URL
          ? TENDERLY_RPC_URL
          : `https://virtual.mainnet.rpc.tenderly.co/${config.TENDERLY_RPC_KEY}`
    },
    showInProduction: false
  }
};

export const DEFAULT_NETWORK = CHAIN_INFO[SupportedChainId.MAINNET];

export const ETH_TX_STATE_DIFF_ENDPOINT = (network: SupportedNetworks): string =>
  `https://statediff.ethtx.info/api/decode/state-diffs/${network}`;

export const SIMULATE_TX_GAS = '0x1c6b9e'; // 1862558 wei

export const SIMULATE_TX_GAS_PRICE = '0x23bd501f00'; // 153500000000 wei or 153.5 Gwei

export const SIGNATURE_CAST = '0x96d373e5'; // Signature for 'cast()'

export const SIMULATE_TX_VALUE = '0';

export const SIMULATE_TX_FROM = '0x5cab1e5286529370880776461c53a0e47d74fb63'; // The chief-keeper EOA, owned by TO, used to cast spells

export const AVG_BLOCKS_PER_DAY = 6500;

export const GASNOW_ENDPOINT = 'https://beaconcha.in/api/v1/execution/gasnow';
export const GASNOW_URL = 'https://beaconcha.in/gasnow';
