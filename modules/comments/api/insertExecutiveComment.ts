import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import invariant from 'tiny-invariant';
import { ExecutiveComment } from '../types/executiveComment';

export async function insertExecutiveComment(newComment: ExecutiveComment): Promise<ExecutiveComment> {
  // query db
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'Mongo client failed to connect');

  const collection = db.collection('executiveComments');

  await collection.insertOne(newComment);

  return newComment;
}
