import Maker from '@makerdao/dai';

export const ETH = Maker.ETH;
export const USD = Maker.USD;

function networkToRpc(network) {
  switch (network) {
    case 'mainnet':
      return `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
    case 'kovan':
      return `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`;
  }
}

export async function instantiateMaker(network) {
  const rpcUrl = networkToRpc(network);
  const maker = await Maker.create('http', {
    provider: {
      url: rpcUrl,
      type: 'HTTP',
    },
    web3: {
      pollingInterval: network === 'testnet' ? 100 : null,
    },
    multicall: true,
  });
  window.maker = maker; // for debugging
  return maker;
}
