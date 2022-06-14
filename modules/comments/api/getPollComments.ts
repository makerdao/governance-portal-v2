import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { PollComment, PollCommentFromDB, PollCommentsAPIResponseItem } from '../types/comments';
import uniqBy from 'lodash/uniqBy';
import { markdownToHtml } from 'lib/markdown';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { ethers } from 'ethers';
export async function getPollComments(
  pollId: number,
  network: SupportedNetworks
): Promise<PollCommentsAPIResponseItem[]> {
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('comments');
  // decending sort
  const commentsFromDB: PollCommentFromDB[] = await collection
    .find({ pollId, network, commentType: 'poll' })
    .sort({ date: -1 })
    .toArray();
  const comments: PollComment[] = await Promise.all(
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
  const promises = uniqueComments.map(async (comment: PollComment) => {
    // verify tx ownership
    const transaction = await provider.getTransaction(comment.txHash as string);

    const isValid =
      transaction &&
      ethers.utils.getAddress(transaction.from).toLowerCase() ===
        ethers.utils.getAddress(comment.hotAddress).toLowerCase();
    return {
      comment,
      isValid,
      completed: transaction && transaction.confirmations > 10,
      address: await getAddressInfo(comment.voterAddress, network)
    };
  });

  const response = await Promise.all(promises);

  return response.filter(i => i.isValid) as PollCommentsAPIResponseItem[];
}
