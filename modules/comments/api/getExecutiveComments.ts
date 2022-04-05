import { SupportedNetworks } from 'modules/web3/constants/networks';
import invariant from 'tiny-invariant';
import uniqBy from 'lodash/uniqBy';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import {
  ExecutiveComment,
  ExecutiveCommentFromDB,
  ExecutiveCommentsAPIResponseItem
} from '../types/comments';
import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { markdownToHtml } from 'lib/utils';

export async function getExecutiveComments(
  spellAddress: string,
  network: SupportedNetworks
): Promise<ExecutiveCommentsAPIResponseItem[]> {
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('comments');
  // decending sort
  const commentsFromDB: ExecutiveCommentFromDB[] = await collection
    .find({ spellAddress, network, commentType: 'executive' })
    .sort({ date: -1 })
    .toArray();

  const comments: ExecutiveComment[] = await Promise.all(
    commentsFromDB.map(async comment => {
      const { _id, voterAddress, ...rest } = comment;

      const commentBody = await markdownToHtml(comment.comment);
      return {
        ...rest,
        comment: commentBody,
        voterAddress: voterAddress.toLowerCase()
      };
    })
  );

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
