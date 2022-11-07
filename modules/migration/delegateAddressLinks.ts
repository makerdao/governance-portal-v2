import { SupportedNetworks } from 'modules/web3/constants/networks';

export const delegateAddressLinks = {
  // Format: Old Address -> new address
  [SupportedNetworks.GOERLI]: {
    '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xDED748b570C810f46f29c6B97807557820023BFA',
    '0x44ad5FA4D36Dc37b7B83bAD6Ac6F373C47C3C837': '0x846FF49d72F4e3CA7a3D318820C6C2debe23c68A',
    '0xAdb3bDe018dB0a237215b632A170491982d936D1': '0x534Cd2075E427096DFABCFD9C63876F7ae60e3d9',
    '0x2DD49B0AaCbAB93D7c8327e62DD145DEF2B84C6f': '0x7C924CCE0Dc79655019B142F26fA26df62777884',
    '0x68208127C20185b2C9772FE31e970B5704cd8922': '0x772c7141cd4A961aBec1B4241641f810d6188149'
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
    '0x5b9C98e8A3D9Db6cd4B4B4C1F92D0A551D06F00D': '0xd0701695E038F8DC3B158f60ABd45B2CE6B6Fb8d'
  }
};

export const getPreviousOwnerFromNew = (address: string, network: SupportedNetworks): string | undefined => {
  const networkData = delegateAddressLinks[network];

  const newToPrevMap = Object.keys(networkData).reduce((acc, cur) => {
    return {
      ...acc,
      [networkData[cur].toLowerCase()]: cur.toLowerCase()
    };
  }, {});

  return newToPrevMap[address.toLowerCase()];
};

export const getNewOwnerFromPrevious = (address: string, network: SupportedNetworks): string | undefined => {
  const networkData = delegateAddressLinks[network];

  const prevToNewMap = Object.keys(networkData).reduce((acc, cur) => {
    return {
      ...acc,
      [cur.toLowerCase()]: networkData[cur].toLowerCase()
    };
  }, {});

  return prevToNewMap[address.toLowerCase()];
};
