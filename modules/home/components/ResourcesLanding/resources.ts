/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export enum ResourceCategory {
  ALL_RESOURCES = 'All Resources',
  GOVERNANCE = 'Governance',
  PRODUCTS_AND_TOOLS = 'Products & Tools',
  DEVELOPERS = 'Developers'
}

enum ResourceBackground {
  GOVERNANCE = 'linear-gradient(260.14deg, #6A6CFB 0%, #2A197D 97.43%)',
  PRODUCTS_AND_TOOLS = 'linear-gradient(260.14deg, #F7A7F9 0%, #6D28FF 97.43%)',
  DEVELOPERS = 'linear-gradient(260.14deg, #FFCD6B 0%, #EB5EDF 97.43%)'
}

export enum ResourceColor {
  GOVERNANCE = '#504DFF',
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
    title: 'Sky Governance Forum',
    url: 'https://forum.sky.money/',
    category: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_1.svg',
    summary:
      'Participate in or start new discussions related to the governance of MakerDAO and the Maker protocol.'
  },
  {
    title: 'MKR to SKY Migration Portal',
    url: 'https://upgrademkrtosky.sky.money/',
    category: ResourceCategory.GOVERNANCE,
    bg: ResourceBackground.GOVERNANCE,
    color: ResourceColor.GOVERNANCE,
    logo: '/assets/resource_icon_2.svg',
    summary:
      'Documentation on the Maker protocol & MakerDAO processes, written for MKR holders that actively participate in governance.'
  },
  {
    title: 'sky.money',
    url: 'https://sky.money/',
    category: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/sky_logo_outline.svg',
    summary: 'A user interface for interacting with the Sky ecosystem.'
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
    title: 'Info Dashboard',
    url: 'https://info.sky.money/',
    category: ResourceCategory.PRODUCTS_AND_TOOLS,
    bg: ResourceBackground.PRODUCTS_AND_TOOLS,
    color: ResourceColor.PRODUCTS_AND_TOOLS,
    logo: '/assets/resource_icon_6.svg',
    summary: 'A data dashboard for the Sky Ecosystem, displaying burn rate, revenues, expenses and more.'
  },
  {
    title: 'Developer Portal',
    url: 'https://developers.sky.money/',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_7.svg',
    summary:
      'Technical documentation about the MakerDAO protocol, covering all its mechanisms, smart contracts and more.'
  },
  {
    title: 'MakerDAO GitHub',
    url: 'https://github.com/makerdao/',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_8.svg',
    summary:
      'GitHub organization with many repositories relevant to MakerDAO and goverance, including the community repo and the codebase for this site.'
  },
  {
    title: 'Governance API Docs',
    url: 'https://vote.sky.money/api-docs',
    category: ResourceCategory.DEVELOPERS,
    bg: ResourceBackground.DEVELOPERS,
    color: ResourceColor.DEVELOPERS,
    logo: '/assets/resource_icon_9.svg',
    summary:
      'Automatically generated API documentation for the Governance Portal API, used to query MakerDAO governance data.'
  }
];
