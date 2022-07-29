import type { AddEthereumChainParameter } from '@web3-react/types';

// this file is temporary

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18
};

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18
};

interface BasicChainInformation {
  urls: string[];
  name: string;
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency'];
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls'];
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency;
}

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId];
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls
    };
  } else {
    return chainId;
  }
}

export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  1: {
    urls: [
      `https://mainnet.infura.io/v3/${process.env.infuraKey || ''}`,
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey || ''}`,
      'https://cloudflare-eth.com'
    ].filter(url => url !== undefined),
    name: 'Mainnet'
  },
  3: {
    urls: [`https://ropsten.infura.io/v3/${process.env.infuraKey || ''}`].filter(url => url !== undefined),
    name: 'Ropsten'
  },
  4: {
    urls: [`https://rinkeby.infura.io/v3/${process.env.infuraKey || ''}`].filter(url => url !== undefined),
    name: 'Rinkeby'
  },
  5: {
    urls: [`https://goerli.infura.io/v3/${process.env.infuraKey || ''}`].filter(url => url !== undefined),
    name: 'Görli'
  }
};

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{
  [chainId: number]: string[];
}>((accumulator, chainId) => {
  const validURLs: string[] = CHAINS[Number(chainId)].urls;

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }

  return accumulator;
}, {});
