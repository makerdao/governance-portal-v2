import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import McdPlugin from '@makerdao/dai-plugin-mcd';
import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import invariant from 'tiny-invariant';

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
      [GovernancePlugin, { network, staging: !process.env.USE_PROD_SPOCK }]
    ],
    provider: {
      url: networkToRpc(network, 'infura'),
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

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  invariant(
    process.env.MONGODB_URI && process.env.MONGODB_COMMENTS_DB,
    'Missing required Mongodb environment variables'
  );

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  const db = await client.db(process.env.MONGODB_COMMENTS_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
