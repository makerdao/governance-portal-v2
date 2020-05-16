import Maker from '@makerdao/dai';
import McdPlugin, { MDAI } from '@makerdao/dai-plugin-mcd';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import Router from 'next/router';

import { DEFAULT_NETWORK, NETWORKS } from './constants';

export const ETH = Maker.ETH;
export const USD = Maker.USD;
export const MKR = Maker.MKR;
export const DAI = MDAI;

export function networkToRpc(network) {
  switch (network) {
    case NETWORKS.mainnet:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
    case NETWORKS.kovan:
      return `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`;
    case NETWORKS.testchain:
      return `http://localhost:2000`;
    default:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
  }
}

function chainIdToNetworkName(chainId) {
  switch (chainId) {
    case 1:
      return NETWORKS.mainnet;
    case 42:
      return NETWORKS.kovan;
    case 999:
      return NETWORKS.testchain;
    case 1337:
      return NETWORKS.testchain;
    default:
      return undefined;
  }
}

const _network = determineNetwork();
const _maker = Maker.create('http', {
  plugins: [
    [McdPlugin, { prefetch: false }],
    [GovernancePlugin, { network: _network }]
  ],
  provider: {
    url: networkToRpc(_network),
    type: 'HTTP'
  },
  web3: {
    pollingInterval: null
  },
  log: false,
  multicall: true
});

function determineNetwork() {
  if (typeof __TESTCHAIN__ !== 'undefined' && __TESTCHAIN__) {
    // if the testhcain global is set, connect to the testchain
    return NETWORKS.testchain;
  } else if (typeof window === 'undefined') {
    // if not on the browser, connect to the default network
    // (eg when generating static pages at build-time)
    return DEFAULT_NETWORK;
  } else {
    // otherwise, to determine the network...
    // 1) check the URL
    if (window.location.search.includes('mainnet')) {
      return NETWORKS.mainnet;
    } else if (window.location.search.includes('kovan')) {
      return NETWORKS.kovan;
    } else if (window.location.search.includes('testchain')) {
      return NETWORKS.testchain;
    }
    // 2) check the browser provider if there is one
    if (typeof window.ethereum !== 'undefined') {
      const providerNetwork = chainIdToNetworkName(
        parseInt(window.ethereum.chainId)
      );
      if (providerNetwork === NETWORKS.mainnet) {
        return NETWORKS.mainnet;
      } else if (providerNetwork === NETWORKS.kovan) {
        return NETWORKS.kovan;
      } else if (providerNetwork === NETWORKS.testchain) {
        return NETWORKS.testchain;
      }
    }
    // if it's not clear what network to connect to, use the default
    return DEFAULT_NETWORK;
  }
}

if (
  typeof window !== 'undefined' &&
  typeof window?.ethereum?.on !== 'undefined'
) {
  window.ethereum.autoRefreshOnNetworkChange = false;
  function handleChainChanged(chainId) {
    const newNetwork = chainIdToNetworkName(parseInt(chainId));
    Router.push({
      pathname: Router.router.pathname,
      query: { network: newNetwork || defaultNetwork }
    });
  }
  // update the URL anytime the provider's network changes
  // we use both methods as the latter doesn't work atm, but the former will be removed once the latter is ready
  // https://github.com/MetaMask/metamask-extension/issues/8077
  window.ethereum.on('chainIdChanged', handleChainChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
}

function getMaker() {
  return _maker;
}

function getNetwork() {
  return _network;
}

function isDefaultNetwork() {
  return getNetwork() === DEFAULT_NETWORK;
}

export default getMaker;
export { getNetwork, isDefaultNetwork, chainIdToNetworkName };
