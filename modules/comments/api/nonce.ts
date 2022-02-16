// Generates a nonce for an address and stores it on the DB.
// We use this nonce to verify the message

import { connectToDatabase } from 'modules/db/helpers/connectToDatabase';
import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from 'uuid';

export async function generateNonce(address: string): Promise<string> {
  const { db, client } = await connectToDatabase();
  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('comment-nonces');

  // If we have a previous nonce, use that.
  const previousNonces = await collection.find({
    address
  });

  if (previousNonces.length > 0) {
    return previousNonces[0].nonce;
  }

  // Create a new nonce structure for the DB
  const uid = uuidv4();
  const nonce = `/${address}/${uid}`; // The nonce identifier that the user will sign

  // Insert new nonce
  await collection.insertOne({
    uid,
    nonce,
    address,
    createdAt: Date.now()
  });
  return nonce;
}

// Removes all nonces for an address
export async function removeNonces(address: string): Promise<void> {
  const { db, client } = await connectToDatabase();
  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('comment-nonces');

  await collection.remove({
    address
  });
}

export async function getNonce(address: string): Promise<{
  uid: string;
  nonce: string;
  address: string;
}> {
  const { db, client } = await connectToDatabase();
  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('comment-nonces');

  return await collection.findOne({
    address
  });
}
