/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export enum DelegateStatusEnum {
  recognized = 'recognized',
  expired = 'expired',
  shadow = 'shadow'
}

export enum MKRWeightTimeRanges {
  day = 'day',
  week = 'week',
  month = 'month'
}

export enum DelegateTypeEnum {
  RECOGNIZED = 'RECOGNIZED',
  SHADOW = 'SHADOW',
  ALL = 'ALL'
}

export const MEET_DELEGATE_URLS = {
  // Schuppi
  '0xb4b82978fce6d26a22dea7e653bb9ce8e14f8056': 'https://www.youtube-nocookie.com/embed/3483QFS4_qQ',
  // Feedblack Loops
  '0x92e1ca8b69a44bb17afa92838da68fc41f12250a': 'https://www.youtube-nocookie.com/embed/n4eILXWY_28',
  // Flip Flop Flap
  '0x0f4be9f208c552a6b04d9a1222f385785f95beaa': 'https://www.youtube-nocookie.com/embed/SVUm1Bz0U9A',
  // Gauntlet
  '0xa149694b5b67e2078576a6f225de6b138efba043':
    'https://www.youtube-nocookie.com/embed/PbdUe4diPjg?start=1710',
  // GFX
  '0x869147940842bb1aa4c40e60c5e583f4911f2e02': 'https://www.youtube-nocookie.com/embed/SoiTAghnWFE',
  // JustinCase
  '0x4e324f2327fa3e567d802ddcf655f7188eb62754': 'https://www.youtube-nocookie.com/embed/brNkBB33H84',
  // Acre
  '0x06e8dedf9e1adb1eba32f36ea9223770ba378b77': 'https://www.youtube-nocookie.com/embed/9z96VWDC_Eo',
  // Hasu
  '0xafaff1a605c373b43727136c995d21a7fcd08989': 'https://www.youtube-nocookie.com/embed/u7tT3HgAXqo',
  // StableNode
  '0x8804d391472126da56b9a560aef6c6d5aaa7607b': 'https://www.youtube-nocookie.com/embed/hNMKg9BNWjU',
  // Flipside
  '0x84b05b0a30b6ae620f393d1037f217e607ad1b96':
    'https://www.youtube-nocookie.com/embed/hNMKg9BNWjU?start=1751',
  // Penn Blockchain
  '0x7ddb50a5b15aea7e7cf9ac8e55a7f9fd9d05ecc6': 'https://www.youtube-nocookie.com/embed/aI-nDmwnWpY',
  // London Business School
  '0xf1792852bf860b4ef84a2869df1550bc80ec0ab7': 'https://www.youtube-nocookie.com/embed/9B-gDrEiK6o?start=48',
  // Blockchain@Columbia
  '0xb8df77c3bd57761bd0c55d2f873d3aa89b3da8b7':
    'https://www.youtube-nocookie.com/embed/9B-gDrEiK6o?start=2123',
  // mhonkasalo & teemulau
  '0xaa19f47e6acb02df88efa9f023f2a38412069902': 'https://www.youtube-nocookie.com/embed/KYiC2hVHwII',
  // ChicagoDAO
  '0x797d63cb6709c79b9eca99d9585ea613da205156':
    'https://www.youtube-nocookie.com/embed/KYiC2hVHwII?start=1806',
  // Chris Blec
  '0x2c511d932c5a6fe4071262d49bfc018cfbaaa1f5':
    'https://player.vimeo.com/video/716051719?h=3c7aa24f14&color=68FEE3&autoplay=1',
  // pvl
  '0xd9d00c42bed99a6d3a0f2902c640bccceecf6c29': 'https://www.youtube-nocookie.com/embed/yIHFRJDA7cM',
  // CodeKnight
  '0xe89f973a19cd76c3e5e236062668e43042176638': 'https://www.youtube-nocookie.com/embed/KZFZ1xQ6ZzU',
  // monetsupply
  '0xb056e45fd47d962f4ef25714714abc7a79886064': 'https://www.youtube-nocookie.com/embed/PbdUe4diPjg',
  // CalBlockchain
  '0x8f5b93378d59e35799573530a9860597e14b7178': 'https://www.youtube-nocookie.com/embed/axEO50fMujs',
  // ConsenSys
  '0x40f784b16b2d405efd4e9eb7d0663398d7d886fb':
    'https://www.youtube-nocookie.com/embed/axEO50fMujs?start=1707',
  // ONESTONE
  '0x9301f3bb7a71ab4d46b17bd1f8254142fa8f26ad': 'https://www.youtube-nocookie.com/embed/MqbG43Ywr5E',
  // RiskDAO
  '0xd0df93fc03a7291e31947f5cc6ef526f5b67b0ea': 'https://www.youtube-nocookie.com/embed/RHYU18Svr8c',
  // Jason Yanowitz
  '0xd1fc89e0c3828f50b650e1309e30cb4fcf2bdbe3': 'https://www.youtube-nocookie.com/embed/nUkjsG1VUzg',
  // Frontier Research LLC
  '0x316090e23cc44e70245ba9846404413aca2df16f':
    'https://www.youtube-nocookie.com/embed/nUkjsG1VUzg?start=1819',
  // HKUST EPI Blockchain
  '0x925016c2367802632cabdf13b5fc2c1bdc2c301a': 'https://www.youtube-nocookie.com/embed/S-ON_8Sulm8'
};
