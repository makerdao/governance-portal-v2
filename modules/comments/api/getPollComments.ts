import { connectToDatabase } from 'lib/api/utils';
import { SupportedNetworks } from 'lib/constants';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { PollComment, PollCommentFromDB } from '../types/pollComments';

export async function getPollComments(
  pollId: number,
  network: SupportedNetworks
): Promise<PollCommentsAPIResponseItem[]> {
  const { db, client } = await connectToDatabase();

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('pollingComments');
  // decending sort
  const commentsFromDB: PollCommentFromDB[] = await collection
    .find({ pollId, network })
    .sort({ date: -1 })
    .toArray();

  const comments: PollComment[] = commentsFromDB.map(comment => {
    const { _id, ...rest } = comment;
    return rest;
  });

  const promises = comments.map(async comment => {
    return {
      comment,
      address: await getAddressInfo(
        comment.delegateAddress ? comment.delegateAddress : comment.voterAddress,
        network
      )
    };
  });

  const response = await Promise.all(promises);

  return response;
}
