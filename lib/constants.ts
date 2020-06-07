export enum SupportedNetworks {
  MAINNET = 'mainnet',
  KOVAN = 'kovan',
  TESTNET = 'testnet'
}

export const CMS_ENDPOINTS = {
  [SupportedNetworks.MAINNET]: 'https://cms-gov.makerfoundation.com/content/governance-dashboard',
  [SupportedNetworks.KOVAN]: 'https://elb.cms-gov.makerfoundation.com:444/content/governance-dashboard'
};

export const GOV_BLOG_POSTS_ENDPOINT =
  'https://blog.makerdao.com/wp-json/wp/v2/posts?categories=22&per_page=3';

export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;

export const ETHERSCAN_PREFIXES: { [key in SupportedNetworks]?: string } = {
  [SupportedNetworks.MAINNET]: '',
  [SupportedNetworks.KOVAN]: 'kovan.'
};
