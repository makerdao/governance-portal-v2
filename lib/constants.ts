export enum SupportedNetworks {
  MAINNET = 'mainnet',
  KOVAN = 'kovan',
  TESTNET = 'testnet'
}

export const CMS_ENDPOINTS = {
  [SupportedNetworks.MAINNET]: {
    allTopics: 'https://cms-gov.makerfoundation.com/content/governance-dashboard',
    allSpells: 'https://cms-gov.makerfoundation.com/content/all-spells'
  },
  [SupportedNetworks.KOVAN]: {
    [SupportedNetworks.MAINNET]: {
      allTopics: 'https://elb.cms-gov.makerfoundation.com:444/content/governance-dashboard',
      allSpells: 'https://elb.cms-gov.makerfoundation.com:444/content/all-spells'
    }
  }
};

export const GOV_BLOG_POSTS_ENDPOINT =
  'https://blog.makerdao.com/wp-json/wp/v2/posts?categories=22&per_page=3';

export const DEFAULT_NETWORK = SupportedNetworks.MAINNET;

export const ETHERSCAN_PREFIXES = {
  [SupportedNetworks.MAINNET]: '',
  [SupportedNetworks.KOVAN]: 'kovan.'
};

export const ETH_TX_STATE_DIFF_ENDPOINT = (network: SupportedNetworks.MAINNET | SupportedNetworks.KOVAN) =>
  `https://statediff.ethtx.info/api/decode/state-diffs/${network}`;

export const ABSTAIN = 0;
