import logger from 'lib/logger';
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
      comments
        .filter(c => c.comment.length > 0)
        .map(comment => {
          return {
            ...comment,
            comment: comment.comment.substring(0, 1500),
            commentType: 'poll'
          };
        })
    );
    logger.debug(`insertPollComments Inserted ${comments.length} comments.`);
  } catch (e) {
    logger.error(
      `insertPollComments: A MongoBulkWriteException occurred, but there are ${e.result.result.nInserted} successfully processed documents.`
    );
  }

  return comments;
}
