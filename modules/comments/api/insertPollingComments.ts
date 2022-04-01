import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import invariant from 'tiny-invariant';
import { PollComment } from '../types/comments';

export async function insertPollComments(comments: PollComment[]): Promise<PollComment[]> {
  // query db
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'Mongo client failed to connect');

  const collection = db.collection('comments');

  try {
    await collection.insertMany(
      comments.map(comment => {
        return {
          ...comment,
          commentType: 'poll'
        };
      })
    );
  } catch (e) {
    console.error(
      `A MongoBulkWriteException occurred, but there are ${e.result.result.nInserted} successfully processed documents.`
    );
  }

  return comments;
}
