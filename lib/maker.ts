import Maker from '@makerdao/dai';
import McdPlugin, { DAI } from '@makerdao/dai-plugin-mcd';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import Router from 'next/router';

import { SupportedNetworks, DEFAULT_NETWORK } from './constants';

export const ETH = Maker.ETH;
export const USD = Maker.USD;
export const MKR = Maker.MKR;

export function networkToRpc(network: SupportedNetworks) {
  switch (network) {
    case SupportedNetworks.MAINNET:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
    case SupportedNetworks.KOVAN:
      return `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`;
    case SupportedNetworks.TESTNET:
      return 'http://localhost:2000';
    default:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
  }
}

function chainIdToNetworkName(chainId: number): SupportedNetworks {
  switch (chainId) {
    case 1:
      return SupportedNetworks.MAINNET;
    case 42:
      return SupportedNetworks.KOVAN;
    case 999:
      return SupportedNetworks.TESTNET;
    case 1337:
      return SupportedNetworks.TESTNET;
    default:
      throw new Error(`Unsupported chain id ${chainId}`);
  }
}

// make a snap judgement about which network to use so that we can immediately start loading state
function determineNetwork(): SupportedNetworks {
  if (typeof (global as any).__TESTCHAIN__ !== 'undefined' && (global as any).__TESTCHAIN__) {
    // if the testhchain global is set, connect to the testchain
    return SupportedNetworks.TESTNET;
  } else if (typeof window === 'undefined') {
    // if not on the browser, connect to the default network
    // (eg when generating static pages at build-time)
    return DEFAULT_NETWORK;
  } else {
    // otherwise, to determine the network...
    // 1) check the URL
    if (window.location.search.includes('mainnet')) {
      return SupportedNetworks.MAINNET;
    } else if (window.location.search.includes('kovan')) {
      return SupportedNetworks.KOVAN;
    } else if (window.location.search.includes('testnet')) {
      return SupportedNetworks.TESTNET;
    }
    // 2) check the browser provider if there is one
    if (typeof (window as any).ethereum !== 'undefined') {
      const chainId = parseInt((window as any).ethereum.chainId);
      try {
        const providerNetwork = chainIdToNetworkName(chainId);
        return providerNetwork;
      } catch (err) {
        console.log(`Browser provider connected to unsupported network with id ${chainId}`);
      }
    }
    // if it's not clear what network to connect to, use the default
    return DEFAULT_NETWORK;
  }
}

function handleChainChanged(chainId: string) {
  const newNetwork = chainIdToNetworkName(parseInt(chainId));
  const asPath = Router?.router?.asPath?.replace(/network=[a-z]+/i, '');
  if (Router?.router) {
    Router.push(
      {
        pathname: Router.router.pathname,
        query: { network: newNetwork || DEFAULT_NETWORK }
      },
      asPath
    );
  }
}

if (typeof window !== 'undefined' && typeof (window as any)?.ethereum?.on !== 'undefined') {
  (window as any).ethereum.autoRefreshOnNetworkChange = false;
  // update the URL anytime the provider's network changes
  // we use both methods as the latter doesn't work atm, but the former will be removed once the latter is ready
  // https://github.com/MetaMask/metamask-extension/issues/8077
  (window as any).ethereum.on('chainIdChanged', handleChainChanged);
  (window as any).ethereum.on('chainChanged', handleChainChanged);
}

let makerSingleton: Promise<Maker>;
function getMaker(): Promise<Maker> {
  if (!makerSingleton) {
    makerSingleton = Maker.create('http', {
      plugins: [
        [McdPlugin, { prefetch: false }],
        [GovernancePlugin, { network: getNetwork(), staging: true }] //TODO: set staging to false before releasing to production
      ],
      provider: {
        url: networkToRpc(getNetwork()),
        type: 'HTTP'
      },
      web3: {
        pollingInterval: null
      },
      log: false,
      multicall: true
    }).then(maker => {
      if (typeof window !== 'undefined') (window as any).maker = maker;
      return maker;
    });
  }

  return makerSingleton;
}

let networkSingleton: SupportedNetworks;
function getNetwork(): SupportedNetworks {
  if (!networkSingleton) networkSingleton = determineNetwork();
  return networkSingleton;
}

function isDefaultNetwork(): boolean {
  return getNetwork() === DEFAULT_NETWORK;
}

function isSupportedNetwork(_network: string): _network is SupportedNetworks {
  return Object.values(SupportedNetworks).some(network => network.toLowerCase() === _network);
}

export default getMaker;
export { DAI, getNetwork, isDefaultNetwork, isSupportedNetwork, chainIdToNetworkName };
