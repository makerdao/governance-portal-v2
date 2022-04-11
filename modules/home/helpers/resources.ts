enum ResourceCategory {
  GOVERNANCE = 'Governance',
  PRODUCTS_AND_TOOLS = 'Products & Tools',
  DEVELOPERS = 'Developers'
}

enum ResourceBackground {
  GOVERNANCE = '/assets/resource_card_green.png',
  PRODUCTS_AND_TOOLS = '/assets/resource_card_purple.png',
  DEVELOPERS = '/assets/resource_card_pink.png'
}

enum ResourceColor {
  GOVERNANCE = '#1ACCA7',
  PRODUCTS_AND_TOOLS = '#4B68FF',
  DEVELOPERS = '#E64BFF'
}

type LandingResource = {
  title: string;
  url: string;
  tag: ResourceCategory;
  bg: string;
  color: string;
  logo: string;
  summary: string;
};

export const resources: LandingResource[] = [
  {
    title: 'Maker Governance Forum',
    url: 'https://forum.makerdao.com/',
    tag: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_1.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Maker Operation Manual',
    url: 'https://manual.makerdao.com',
    tag: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_2.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  // {
  //   title: 'Governance FAQ',
  //   url: 'https://makerdao.world/en/learn/governance/governance-faq',
  //   tag: ResourceCategory.GOVERNANCE,
  //   bg: ResourceBackground.GOVERNANCE,
  //   color: ResourceColor.GOVERNANCE,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  {
    title: 'Governance Tracking Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1LWNlv6hr8oXebk8rvXZBPRVDjN-3OrzI0IgLwBVk0vM/edit#gid=0',
    tag: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_3.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  // {
  //   title: 'Monthly Governance Cycle',
  //   url: 'https://manual.makerdao.com/governance/governance-cycle/monthly-governance-cycle',
  //   tag: ResourceCategory.GOVERNANCE,
  //   bg: ResourceBackground.GOVERNANCE,
  //   color: ResourceColor.GOVERNANCE,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  // {
  //   title: 'Weekly Governance Cycle',
  //   url: 'https://manual.makerdao.com/governance/governance-cycle/weekly-governance-cycle',
  //   tag: ResourceCategory.GOVERNANCE,
  //   bg: ResourceBackground.GOVERNANCE,
  //   color: ResourceColor.GOVERNANCE,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  // {
  //   title: 'Service Status',
  //   url: 'https://makerdao.statuspage.io/',
  //   tag: ResourceCategory.PRODUCTS_AND_TOOLS,
  //   bg: ResourceBackground.PRODUCTS_AND_TOOLS,
  //   color: ResourceColor.PRODUCTS_AND_TOOLS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  {
    title: 'Oasis',
    url: 'https://oasis.app/',
    tag: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_4.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Auctions Dashboard',
    url: 'http://auctions.makerdao.network',
    tag: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_5.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  // {
  //   title: 'Migrate Dashboard',
  //   url: 'http://migrate.makerdao.com',
  //   tag: ResourceCategory.PRODUCTS_AND_TOOLS,
  //   bg: ResourceBackground.PRODUCTS_AND_TOOLS,
  //   color: ResourceColor.PRODUCTS_AND_TOOLS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  {
    title: 'MakerBurn',
    url: 'https://makerburn.com/#/',
    tag: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_6.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  // {
  //   title: 'Dai Stats',
  //   url: 'https://daistats.com/',
  //   tag: ResourceCategory.PRODUCTS_AND_TOOLS,
  //   bg: ResourceBackground.PRODUCTS_AND_TOOLS,
  //   color: ResourceColor.PRODUCTS_AND_TOOLS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  // {
  //   title: 'Whitepaper',
  //   url: 'https://makerdao.com/en/whitepaper/',
  //   tag: ResourceCategory.DEVELOPERS,
  //   bg: ResourceBackground.DEVELOPERS,
  //   color: ResourceColor.DEVELOPERS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  {
    title: 'Technical Docs',
    url: 'https://docs.makerdao.com/',
    tag: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_7.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'API Docs',
    url: 'https://vote.makerdao.com/api-docs',
    tag: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_8.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  // {
  //   title: 'Developer Guides and Tutorials',
  //   url: 'https://github.com/makerdao/developerguides',
  //   tag: ResourceCategory.DEVELOPERS,
  //   bg: ResourceBackground.DEVELOPERS,
  //   color: ResourceColor.DEVELOPERS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  // {
  //   title: 'Brand Assets',
  //   url: '/ac517c82ff9a43089d0db5bb2ee045a4',
  //   tag: ResourceCategory.DEVELOPERS,
  //   bg: ResourceBackground.DEVELOPERS,
  //   color: ResourceColor.DEVELOPERS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  // {
  //   title: 'Oracle Feeds',
  //   url: 'https://makerdao.com/en/feeds/',
  //   tag: ResourceCategory.DEVELOPERS,
  //   bg: ResourceBackground.DEVELOPERS,
  //   color: ResourceColor.DEVELOPERS,
  //   logo: '/assets/resource_icon_1.svg',
  //   summary:
  //     'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  // },
  {
    title: 'MakerDAO GitHub',
    url: 'https://github.com/makerdao/',
    tag: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_9.svg',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  }
];
