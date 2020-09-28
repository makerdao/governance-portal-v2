import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import McdPlugin from '@makerdao/dai-plugin-mcd';
import { ethers } from 'ethers';

import { networkToRpc } from '../../../lib/maker/network';
import { SupportedNetworks } from '../../../lib/constants';

const cachedMakerObjs = {};
export async function getConnectedMakerObj(network: SupportedNetworks): Promise<any> {
  if (cachedMakerObjs[network]) {
    return cachedMakerObjs[network];
  }

  const makerObj = await Maker.create('http', {
    plugins: [
      [McdPlugin, { prefetch: false }],
      [GovernancePlugin, { network, staging: true }] //TODO: set staging to false before releasing to production
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

export async function getTrace(
  method: 'trace_call' | 'trace_replayTransaction',
  parameters: string | { from: string; to: string; data: string },
  network: SupportedNetworks
) {
  try {
    const trace = await new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_KEY).send(method, [
      parameters,
      ['vmTrace', 'stateDiff']
    ]);
    return trace;
  } catch (err) {
    if (process.env.TRACING_RPC_NODE) {
      console.log("Alchemy trace failed. Falling back to Maker's tracing node.");
      const trace = await new ethers.providers.JsonRpcProvider(process.env.TRACING_RPC_NODE).send(method, [
        parameters,
        ['vmTrace', 'stateDiff']
      ]);
      return trace;
    } else {
      throw new Error('Failed to fetch transaction trace');
    }
  }
}
