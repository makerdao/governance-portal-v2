import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
// @ts-ignore
import McdPlugin from '@makerdao/dai-plugin-mcd';

import { networkToRpc } from '../../../lib/maker/network';
import { SupportedNetworks } from '../../../lib/constants';

const cachedMakerObjs = {};
export async function getConnectedMakerObj(network: SupportedNetworks) {
  if (cachedMakerObjs[network]) {
    return cachedMakerObjs[network];
  }

  const makerObj = await Maker.create('http', {
    plugins: [
      [McdPlugin, { prefetch: false }],
      [GovernancePlugin, { network }]
    ],
    provider: {
      url: networkToRpc(network),
      type: 'HTTP'
    },
    web3: {
      pollingInterval: null
    },
    log: false,
    multicall: true
  });

  cachedMakerObjs[network] = makerObj;
  return makerObj;
}
