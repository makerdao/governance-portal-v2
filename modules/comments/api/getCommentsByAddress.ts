import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { getGaslessNetwork, getGaslessProvider, getProvider } from 'modules/web3/helpers/chain';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { CommentFromDB, CommentsAPIResponseItem } from '../types/comments';
import { markdownToHtml } from 'lib/markdown';
import { getCommentTransactionStatus } from './getCommentTransaction';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export async function getCommentsByAddress(
  address: string,
  network: SupportedNetworks
): Promise<{
  comments: CommentsAPIResponseItem[];
}> {
  const { db, client } = await connectToDatabase;

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const addressInfo = await getAddressInfo(address, network);
  const addresses = [address.toLowerCase()];

  if (addressInfo.delegateInfo?.previous?.address) {
    addresses.push(addressInfo.delegateInfo?.previous?.voteDelegateAddress.toLowerCase());
  }
  const gaslessNetwork = getGaslessNetwork(network);
  // decending sort
  const commentsFromDB: CommentFromDB[] = await db
    .collection('comments')
    .find({ voterAddress: { $in: addresses }, network: { $in: [network, gaslessNetwork] } })
    .sort({ date: -1 })
    .toArray();
  const provider = await getProvider(network);
  const gaslessProvider = await getGaslessProvider(network);

  const comments: CommentsAPIResponseItem[] = await Promise.all(
    commentsFromDB.map(async comment => {
      const { _id, ...rest } = comment;
      const commentBody = await markdownToHtml(comment.comment, true);
      // verify tx ownership
      const { completed, isValid } = await getCommentTransactionStatus(
        network,
        comment.gaslessNetwork ? gaslessProvider : provider,
        comment
      );

      const item: CommentsAPIResponseItem = {
        comment: {
          ...rest,
          comment: commentBody
        },
        isValid,
        completed,

        address: addressInfo
      };

      return item;
    })
  );

  return {
    comments: comments.filter(i => i.isValid)
  };
}
