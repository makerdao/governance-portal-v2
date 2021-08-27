import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import invariant from 'tiny-invariant';

import { SupportedNetworks } from 'lib/constants';
import { config } from 'lib/config';


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
