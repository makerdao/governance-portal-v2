import { connectToDatabase } from 'lib/api/utils';
import { SupportedNetworks } from 'lib/constants';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { PollComment, PollCommentFromDB } from '../types/pollComments';
import uniqBy from 'lodash/uniqBy';

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

  // only return the latest comment from each address
  const uniqueComments = uniqBy(comments, 'voterAddress');

  const promises = uniqueComments.map(async (comment: PollComment) => {
    return {
      comment,
      address: await getAddressInfo(
        comment.delegateAddress
          ? comment.delegateAddress
          : comment.voteProxyAddress
          ? comment.voteProxyAddress
          : comment.voterAddress,
        network
      )
    };
  });

  const response = await Promise.all(promises);

  return response as PollCommentsAPIResponseItem[];
}
