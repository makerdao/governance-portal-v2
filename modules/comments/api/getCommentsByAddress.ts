import connectToDatabase from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { CommentFromDB, CommentsAPIResponseItem } from '../types/comments';
import { markdownToHtml } from 'lib/markdown';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getRPCFromChainID } from 'modules/web3/helpers/getRPC';
import { ethers } from 'ethers';
import logger from 'lib/logger';
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

  const rpcUrl = getRPCFromChainID(networkNameToChainId(network));
  const provider = await new ethers.providers.JsonRpcProvider(rpcUrl);

  const comments: CommentsAPIResponseItem[] = await Promise.all(
    commentsFromDB.map(async comment => {
      const { _id, ...rest } = comment;
      const commentBody = await markdownToHtml(comment.comment, true);
      // verify tx ownership
      //TODO: handle arbitrum transactions
      let transaction;
      if (comment.txHash) {
        transaction = await provider
          .getTransaction(comment.txHash as string)
          .catch(e =>
            logger.error(
              `GetCommentsByAddress: ${address}, There was a problem fetching transaction for comment ID: ${_id}. Error: ${e}`
            )
          );
      }

      const isValid =
        transaction &&
        ethers.utils.getAddress(transaction.from).toLowerCase() ===
          ethers.utils.getAddress(comment.hotAddress).toLowerCase();
      return {
        comment: {
          ...rest,
          comment: commentBody
        },
        isValid,
        completed: transaction && transaction.confirmations > 10,

        address: addressInfo
      };
    })
  );

  return {
    comments
  };
}
