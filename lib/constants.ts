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
    allTopics: 'https://elb.cms-gov.makerfoundation.com:444/content/governance-dashboard',
    allSpells: 'https://elb.cms-gov.makerfoundation.com:444/content/all-spells'
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

export const oldChiefAddress = {
  mainnet: '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5',
  kovan: '0xbbffc76e94b34f72d96d054b31f6424249c1337d',
  testnet: '0x127BFdF59236E7EC1Caab020B844d0B813C3Cc39'
};

export const oldVoteProxyFactoryAddress = {
  mainnet: '0x868ba9aeacA5B73c7C27F3B01588bf4F1339F2bC',
  kovan: '0x3e08741a68c2d964d172793cd0ad14292f658cd8',
  testnet: '0x99eD2B819A93ED703a3786e3141570933E3e3D89'
};

export const oldIouAddress = {
  mainnet: '0x496C67A4CEd9C453A60F3166AB4B329870c8E355',
  kovan: '0x4D5d2F7E1284bc5c871ce3e1A997Bd8646c75ba5',
  testnet: '0xF2C26512fcF36dE7117d0E2bB521e11398a55871'
};

export const SPELL_SCHEDULED_DATE_OVERRIDES = {
  '0xB70fB4eE900650DCaE5dD63Fd06E07F0b3a45d13': 'December 7, 2020, 14:00 UTC'
};

export const POLL_CATEGORIZATION_ENDPOINT =
  'https://raw.githubusercontent.com/makerdao/community/f2c2fb7355510972984e46f43275c8b9a61e67f9/governance/polls/meta/retroactive-poll-categorization.json';
