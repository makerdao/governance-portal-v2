export const CMS_ENDPOINTS = {
  mainnet: 'https://cms-gov.makerfoundation.com/content/governance-dashboard',
  kovan:
    'https://elb.cms-gov.makerfoundation.com:444/content/governance-dashboard'
};

export const GOV_BLOG_POSTS_ENDPOINT =
  'https://blog.makerdao.com/wp-json/wp/v2/posts?categories=22&per_page=3';

export enum SupportedNetworks {
  MAINNET = 'mainnet',
  KOVAN = 'kovan',
  TESTNET = 'testnet'
}

export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;

export const ETHERSCAN_PREFIXES: { [key in SupportedNetworks]?: string } = {
  mainnet: '',
  kovan: 'kovan.'
};
