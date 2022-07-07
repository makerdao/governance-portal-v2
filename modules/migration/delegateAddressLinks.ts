import { SupportedNetworks } from 'modules/web3/constants/networks';

export const delegateAddressLinks = {
  // '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xB1a8687b0754CD7610Ae3e59279590dcea84F966',
  [SupportedNetworks.GOERLI]: {
    '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xDED748b570C810f46f29c6B97807557820023BFA',
    '0x44ad5FA4D36Dc37b7B83bAD6Ac6F373C47C3C837': '0x846FF49d72F4e3CA7a3D318820C6C2debe23c68A'
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
