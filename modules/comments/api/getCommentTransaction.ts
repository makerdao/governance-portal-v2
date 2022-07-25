import { ethers } from 'ethers';
import logger from 'lib/logger';
import { FIVE_MINUTES_IN_MS } from 'modules/app/constants/time';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { CommentFromDB } from '../types/comments';

export const getCommentTransaction = async (
  network: SupportedNetworks,
  provider: ethers.providers.JsonRpcProvider,
  comment: CommentFromDB | PollComment
) => {
  const txHash = comment.txHash;
  const cacheKey = `transaction-comment-${txHash}`;

  const cachedResponse = await cacheGet(cacheKey, network);
  if (cachedResponse) {
    return JSON.parse(cachedResponse);
  }

  try {
    const transaction = txHash ? await provider.getTransaction(txHash as string) : null;

    if (transaction) {
      cacheSet(cacheKey, JSON.stringify(transaction), network, FIVE_MINUTES_IN_MS);
    }

    const isValid =
      transaction &&
      (ethers.utils.getAddress(transaction.from).toLowerCase() ===
        ethers.utils.getAddress(comment.hotAddress).toLowerCase() ||
        ethers.utils.getAddress(transaction.from).toLowerCase() ===
          //TODO: get this programatically at the very least
          //For now just hardcoding the relayer address
          '0xccdd98cea0896355ea5082a5f3eb41e8f4761e17');

    return { transaction, isValid };
  } catch (e) {
    logger.error(`Error fetching comment transcation: ${txHash}`);
  }
};
