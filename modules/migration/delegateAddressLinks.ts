import { SupportedNetworks } from 'modules/web3/constants/networks';

export const delegateAddressLinks = {
  [SupportedNetworks.GOERLI]: {
    '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xDED748b570C810f46f29c6B97807557820023BFA',
    '0x44ad5FA4D36Dc37b7B83bAD6Ac6F373C47C3C837': '0x846FF49d72F4e3CA7a3D318820C6C2debe23c68A',
    '0xAdb3bDe018dB0a237215b632A170491982d936D1': '0x534Cd2075E427096DFABCFD9C63876F7ae60e3d9',
    '0x2DD49B0AaCbAB93D7c8327e62DD145DEF2B84C6f': '0x7C924CCE0Dc79655019B142F26fA26df62777884',
    '0x68208127C20185b2C9772FE31e970B5704cd8922': '0x772c7141cd4A961aBec1B4241641f810d6188149'
  },
  [SupportedNetworks.MAINNET]: {}
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
