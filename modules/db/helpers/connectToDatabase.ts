import { MongoClient } from 'mongodb';
import invariant from 'tiny-invariant';

import { config } from 'lib/config';

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

  const db = client.db(config.MONGODB_COMMENTS_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
