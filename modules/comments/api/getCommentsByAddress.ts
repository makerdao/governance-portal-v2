import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { CommentFromDB, CommentsAPIResponseItem } from '../types/comments';

export async function getCommentsByAddress(
  address: string,
  network: SupportedNetworks
): Promise<{
  comments: CommentsAPIResponseItem[];
}> {
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'mongo client failed to connect');

  // decending sort
  const commentsFromDB: CommentFromDB[] = await db
    .collection('comments')
    .find({ voterAddress: address.toLowerCase(), network })
    .sort({ date: -1 })
    .toArray();

  const addressInfo = await getAddressInfo(address, network);

  const comments: CommentsAPIResponseItem[] = commentsFromDB.map(comment => {
    const { _id, ...rest } = comment;
    return {
      comment: rest,
      address: addressInfo
    };
  });

  return {
    comments
  };
}
