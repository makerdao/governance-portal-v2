/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';

export const delegateAddressLinks = {
  // Format: Old Address -> new address
  [SupportedNetworks.TENDERLY]: {
    // Nothing
  },
  [SupportedNetworks.MAINNET]: {
    // schuppi
    '0xd52623EE9A40402A5a9ED82Bb0417e04d88A778C': '0xe491D9EA59cAe5dd84804b224535c64D5CB90c3A',
    // feedblack loops llc
    '0x80882f2A36d49fC46C3c654F7f9cB9a2Bf0423e1': '0x25578C179f8c4c15921457DE61596A1823541BE2',
    // El pro
    '0x688d508f3a6B0a377e266405A1583B3316f9A2B3': '0x26f41D791733ad797dc65Ff05a4080AE7ec7C481',
    // gauntlet
    '0x683a4f9915d6216f73d6df50151725036bd26c02': '0x2e0a608c3d85ee7ee3ee0f557c1dae2f6e01df3f',
    // MonetSupply
    '0x8d07D225a769b7Af3A923481E1FdF49180e6A265': '0x1156E851E64E62A8D2eF4A36E5809802c0E3e836',
    // JustinCase
    '0x967D901496D3c3695f7adCEC1A6a8d7eaE4Cf101': '0xE070c2dCfcf6C6409202A8a210f71D51dbAe9473',
    // GFX
    '0xa6e8772af29b29b9202a073f8e36f447689beef6': '0x0527c9fa5b9eb21d35f8d929c442434b81e7b3bc',
    // ACREinvest
    '0x5b9C98e8A3D9Db6cd4B4B4C1F92D0A551D06F00D': '0xd0701695E038F8DC3B158f60ABd45B2CE6B6Fb8d',
    // StableNode
    '0xa6CA9F4210960DcF667f397bb24f5D023B7eacc8': '0xea172676E4105e92Cc52DBf45fD93b274eC96676',
    // Flipside Governance
    '0x62a43123FE71f9764f26554b3F5017627996816a': '0x4908b04256fdB2be0b2A6B7FAe620662355bAf7A',
    // Penn Blockchain
    '0x070341aA5Ed571f0FB2c4a5641409B1A46b4961b': '0xB8Dcad009E533066F12e408075E10E3a30F1f15A',
    // mhonkasalo & teemulau
    '0x97Fb39171ACd7C82c439b6158EA2F71D26ba383d': '0xE81022B3083323Eb7765414fB9559d106f5a9D0B',
    // KISS AVC - vigilant
    '0x2290c379D9f6828fcC491C2c3534EeCDaF617009': '0x37D58532a985c2aD7a84EC61b0413Cc4B2c48977',
    // Regenerative Finance AVC - BONAPUBLICA
    '0xca6B370bC9e03FaC5aFB57E090783ddb928AEBb6': '0x694C1Dc8abE434e4b46Fc545B4680cdA1F524F21',
    // Resiliency AVC - TRUE NAME
    '0xc3cd0084e63661dfdcc79f34789860752ba39831': '0x3fe3095307ff3cf0ab9de327d01a9abff6ea4a1d',
    // Regenerative Finance AVC - TRUE NAME
    '0xbcb90cbf7ecb6a320e99fabd97f9403bc6662ee8': '0xa44863394e8504212ee7cb4f70044c8e6f857625',
    // Resiliency AVC - QGov
    '0xc0311aa0790bb1f8C1bcFEE6b82d38267D415fC6': '0x4A92599433535b0E61d80085c5a90AeDf5a96467',
    // Regenerative Finance AVC - PBG
    '0x93da8baB74d7210a5c66BB2c0327f8205f465fc3': '0x51C659ee6FccebF7183da4E7D42A83b652F6E741',
    // Regenerative Finance AVC - UPMaker
    '0x61AFeb287bbC52C49405333a05c8FC0d601a8aFB': '0xf295c242bC11F9793498c30be851Ba0a841a0B95',
    // Resiliency AVC - UPMaker
    '0x668fA29d3fD30179df6bc58DA5D42E04360CE27c': '0x80ae9649fC445516f4792AF77b0B8F5809C38231',
    // Sovereign Finance AVC - Blue
    '0x766b115d7E179Bb8980A575dfa02531245E0C4C0': '0x1a6DF5ab553E731a5DD767F44004C12dF81f02FC',
    // Sovereign Finance AVC - Cloaky
    '0x86F8A04FbAF5c8eD0465624c355c1E3C073213cA': '0xe676e1Aa2419b22699aCCFc12C11761F009dDAF0',
    // BLUE
    '0xE5a7023f78c3c0b7B098e8f4aCE7031B3D9aFBaB': '0xe9e3951535053AF603cbE53b0753361459b74D76',
    // testing out a double link for blue
    '0xe9e3951535053AF603cbE53b0753361459b74D76': '0x1465B90e15d0356E5A609633C99291F57B596Ae3'
  }
};

export const getOnePreviousOwnerFromNew = (address: string, network: SupportedNetworks): string | undefined => {
  const networkData = delegateAddressLinks[network] || {};

  const newToPrevMap = Object.keys(networkData).reduce((acc, cur) => {
    return {
      ...acc,
      [networkData[cur].toLowerCase()]: cur.toLowerCase()
    };
  }, {});

  return newToPrevMap[address.toLowerCase()];
};

export const getPreviousOwnerFromNew = (address: string, network: SupportedNetworks): string => {
  let currentAddress = address.toLowerCase();
  let previousAddress = getOnePreviousOwnerFromNew(currentAddress, network);

  while (previousAddress) {
    currentAddress = previousAddress;
    previousAddress = getOnePreviousOwnerFromNew(currentAddress, network);
  }

  return currentAddress;
};

export const getOneNewOwnerFromPrevious = (address: string, network: SupportedNetworks): string | undefined => {
  const networkData = delegateAddressLinks[network] || {};

  const prevToNewMap = Object.keys(networkData).reduce((acc, cur) => {
    return {
      ...acc,
      [cur.toLowerCase()]: networkData[cur].toLowerCase()
    };
  }, {});

  return prevToNewMap[address.toLowerCase()];
};

export const getNewOwnerFromPrevious = (address: string, network: SupportedNetworks): string => {
  let currentAddress = address.toLowerCase();
  let newAddress = getOneNewOwnerFromPrevious(currentAddress, network);

  while (newAddress) {
    currentAddress = newAddress;
    newAddress = getOneNewOwnerFromPrevious(currentAddress, network);
  }

  return currentAddress;
};
