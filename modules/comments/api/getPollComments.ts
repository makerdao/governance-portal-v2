import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { PollComment, PollCommentFromDB } from '../types/pollComments';
import uniqBy from 'lodash/uniqBy';

export async function getPollComments(
  pollId: number,
  network: SupportedNetworks
): Promise<PollCommentsAPIResponseItem[]> {
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('pollingComments');
  // decending sort
  const commentsFromDB: PollCommentFromDB[] = await collection
    .find({ pollId, network })
    .sort({ date: -1 })
    .toArray();

  const comments: PollComment[] = commentsFromDB.map(comment => {
    const { _id, voterAddress, ...rest } = comment;
    return {
      ...rest,
      voterAddress: voterAddress.toLowerCase()
    };
  });

  // only return the latest comment from each address
  const uniqueComments = uniqBy(comments, 'voterAddress');

  const promises = uniqueComments.map(async (comment: PollComment) => {
    return {
      comment,

      address: await getAddressInfo(comment.voterAddress, network)
    };
  });

  const response = await Promise.all(promises);

  return response as PollCommentsAPIResponseItem[];
}
