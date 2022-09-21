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
import { markdownToHtml } from 'lib/markdown';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { ethers } from 'ethers';
import { getCommentTransactionStatus } from './getCommentTransaction';
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

      const commentBody = await markdownToHtml(comment.comment, true);
      return {
        ...rest,
        comment: commentBody,
        voterAddress: voterAddress.toLowerCase()
      };
    })
  );

  // only return the latest comment from each address
  const uniqueComments = uniqBy(comments, 'voterAddress');
  const rpcUrl = getRPCFromChainID(networkNameToChainId(network));
  const provider = await new ethers.providers.JsonRpcProvider(rpcUrl);

  const promises = uniqueComments.map(async (comment: ExecutiveComment) => {
    // verify tx ownership
    const { completed, isValid } = await getCommentTransactionStatus(network, provider, comment);

    return {
      comment,
      address: await getAddressInfo(comment.voterAddress, network),
      isValid,
      completed
    };
  });

  const response = await Promise.all(promises);

  return response.filter(i => i.isValid) as ExecutiveCommentsAPIResponseItem[];
}
