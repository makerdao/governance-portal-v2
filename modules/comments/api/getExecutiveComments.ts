import { SupportedNetworks } from 'modules/web3/constants/networks';
import invariant from 'tiny-invariant';
import uniqBy from 'lodash/uniqBy';
import { ExecutiveComment, ExecutiveCommentFromDB } from '../types/executiveComment';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import { ExecutiveCommentsAPIResponseItem } from '../types/comments';
import { connectToDatabase } from 'modules/db/helpers/connectToDatabase';

export async function getExecutiveComments(
  spellAddress: string,
  network: SupportedNetworks
): Promise<ExecutiveCommentsAPIResponseItem[]> {
  const { db, client } = await connectToDatabase();

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('executiveComments');
  // decending sort
  const commentsFromDB: ExecutiveCommentFromDB[] = await collection
    .find({ spellAddress, network })
    .sort({ date: -1 })
    .toArray();

  const comments: ExecutiveComment[] = commentsFromDB.map(comment => {
    const { _id, ...rest } = comment;
    return rest;
  });

  // only return the latest comment from each address
  const uniqueComments = uniqBy(comments, 'voterAddress');

  const promises = uniqueComments.map(async (comment: ExecutiveComment) => {
    return {
      comment,
      address: await getAddressInfo(comment.voterAddress, network)
    };
  });

  const response = await Promise.all(promises);

  return response as ExecutiveCommentsAPIResponseItem[];
}
