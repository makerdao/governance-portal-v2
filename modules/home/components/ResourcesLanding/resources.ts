export enum ResourceCategory {
  ALL_RESOURCES = 'All Resources',
  GOVERNANCE = 'Governance',
  PRODUCTS_AND_TOOLS = 'Products & Tools',
  DEVELOPERS = 'Developers'
}

enum ResourceBackground {
  GOVERNANCE = 'linear-gradient(260.14deg, #DEE8C4 0%, #AAE4D7 97.43%)',
  PRODUCTS_AND_TOOLS = 'linear-gradient(260.14deg, #E2CCFF 0%, #9A4BFF 97.43%)',
  DEVELOPERS = 'linear-gradient(260.14deg, #F4B7FE 0%, #E64BFF 97.43%)'
}

export enum ResourceColor {
  GOVERNANCE = '#1ACCA7',
  PRODUCTS_AND_TOOLS = '#9A4BFF',
  DEVELOPERS = '#E64BFF'
}

type LandingResource = {
  title: string;
  url: string;
  category: ResourceCategory;
  bg: string;
  color: string;
  logo: string;
  summary: string;
};

export const resources: LandingResource[] = [
  {
    title: 'Maker Governance Forum',
    url: 'https://forum.makerdao.com/',
    category: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_1.svg',
    summary:
      'Participate in or start new discussions related to the governance of MakerDAO and the Maker protocol.'
  },
  {
    title: 'Maker Operation Manual',
    url: 'https://manual.makerdao.com',
    category: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_2.svg',
    summary:
      'Documentation on the Maker protocol & MakerDAO processes, written for MKR holders that actively participate in governance.'
  },
  {
    title: 'Governance Tracking Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1LWNlv6hr8oXebk8rvXZBPRVDjN-3OrzI0IgLwBVk0vM/edit#gid=0',
    category: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_3.svg',
    summary:
      'A daily updated breakdown of the current and future governance actions taking place in MakerDAO.'
  },
  {
    title: 'Oasis',
    url: 'https://oasis.app/',
    category: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_4.svg',
    summary:
      'The most popular user interface for interacting with the Maker Protocol, used for creating & managing vaults.'
  },
  {
    title: 'Auctions Dashboard',
    url: 'http://auctions.makerdao.network',
    category: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_5.svg',
    summary: 'A unified dashboard for understanding & interacting with auctions of the Maker Protocol.'
  },
  {
    title: 'MakerBurn',
    url: 'https://makerburn.com/#/',
    category: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_6.svg',
    summary:
      'A data dashboard for the Maker Protocol and MakerDAO, displaying burn rate, revenues, expenses and more.'
  },
  {
    title: 'Technical Docs',
    url: 'https://docs.makerdao.com/',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_7.svg',
    summary:
      'A data dashboard for the Maker Protocol and MakerDAO, displaying burn rate, revenues, expenses and more.'
  },
  {
    title: 'API Docs',
    url: 'https://vote.makerdao.com/api-docs',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_8.svg',
    summary:
      'Technical documentation about the MakerDAO protocol, covering all its mechanisms, smart contracts and more.'
  },
  {
    title: 'MakerDAO GitHub',
    url: 'https://github.com/makerdao/',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_9.svg',
    summary:
      'Automatically generated API documentation for the Governance Portal API, used to query MakerDAO governance data.'
  }
];
