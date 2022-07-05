export const delegateAddressLinks = {
  // '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xB1a8687b0754CD7610Ae3e59279590dcea84F966',
  '0x2c204c7f54F6FB1014fc5F87526aB469d3Bc098c': '0xDED748b570C810f46f29c6B97807557820023BFA',
  '0x999': '0x888'
};

export const prevToNewMap = Object.keys(delegateAddressLinks).reduce((acc, cur) => {
  return {
    ...acc,
    [cur.toLowerCase()]: delegateAddressLinks[cur].toLowerCase()
  };
}, {});

export const newToPrevMap = Object.keys(delegateAddressLinks).reduce((acc, cur) => {
  return {
    ...acc,
    [delegateAddressLinks[cur].toLowerCase()]: cur.toLowerCase()
  };
}, {});

export const getPreviousOwnerFromNew = (address: string): string | undefined => {
  return newToPrevMap[address.toLowerCase()];
};

export const getNewOwnerFromPrevious = (address: string): string | undefined => {
  return prevToNewMap[address.toLowerCase()];
};
