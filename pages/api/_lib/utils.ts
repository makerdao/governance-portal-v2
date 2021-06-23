import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import McdPlugin from '@makerdao/dai-plugin-mcd';
import LedgerPlugin from '@makerdao/dai-plugin-ledger-web';
import TrezorPlugin from '@makerdao/dai-plugin-trezor-web';
import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import invariant from 'tiny-invariant';

import { networkToRpc } from 'lib/maker/network';
import { SupportedNetworks } from 'lib/constants';
import { config } from 'lib/config';

const cachedMakerObjs = {};
export async function getConnectedMakerObj(network: SupportedNetworks): Promise<any> {
  if (cachedMakerObjs[network]) {
    return cachedMakerObjs[network];
  }
  const makerObj = await Maker.create('http', {
    plugins: [
      [McdPlugin, { prefetch: false }],
      [GovernancePlugin, { network, staging: !config.USE_PROD_SPOCK }],
      LedgerPlugin,
      TrezorPlugin
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

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  invariant(
    config.MONGODB_URI && config.MONGODB_COMMENTS_DB,
    'Missing required Mongodb environment variables'
  );

  const client = await MongoClient.connect(config.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  const db = await client.db(config.MONGODB_COMMENTS_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
