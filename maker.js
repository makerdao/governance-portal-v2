import Maker from '@makerdao/dai';

export const ETH = Maker.ETH;
export const USD = Maker.USD;

export async function instantiateMaker(network) {
  const config = {
    log: true,
    autoAuthenticate: false,
  };

  const maker = await Maker.create('browser', config);
  window.maker = maker; // for debugging
  return maker;
}
