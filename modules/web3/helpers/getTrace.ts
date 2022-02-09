import { ethers } from 'ethers';
import { config } from 'lib/config';
import { SupportedNetworks } from '../constants/networks';

export async function getTrace(
  method: 'trace_call' | 'trace_replayTransaction',
  parameters: string | { from: string; to: string; data: string },
  network: SupportedNetworks
): Promise<any> {
  try {
    const trace = await new ethers.providers.AlchemyProvider(network, config.ALCHEMY_KEY).send(method, [
      parameters,
      ['vmTrace', 'stateDiff']
    ]);
    return trace;
  } catch (err) {
    if (config.TRACING_RPC_NODE) {
      console.log("Alchemy trace failed. Falling back to Maker's tracing node.");
      const trace = await new ethers.providers.JsonRpcProvider(config.TRACING_RPC_NODE).send(method, [
        parameters,
        ['vmTrace', 'stateDiff']
      ]);
      return trace;
    } else {
      throw new Error('Failed to fetch transaction trace');
    }
  }
}
