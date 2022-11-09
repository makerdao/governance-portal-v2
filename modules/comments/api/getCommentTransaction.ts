import { ethers } from 'ethers';
import logger from 'lib/logger';
import { FIVE_MINUTES_IN_MS } from 'modules/app/constants/time';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { CommentFromDB, Comment } from '../types/comments';

export async function getCommentTransactionStatus(
  network: SupportedNetworks,
  provider: ethers.providers.JsonRpcProvider,
  comment: CommentFromDB | Comment
): Promise<{ completed: boolean; isValid: boolean }> {
  const txHash = comment.txHash;
  const cacheKey = `transaction-comment-${txHash}`;

  const cachedResponse = await cacheGet(cacheKey, network);
  if (cachedResponse) {
    return JSON.parse(cachedResponse);
  }

  try {
    const transaction = txHash ? await provider.getTransaction(txHash as string) : null;
    const isValid = !!transaction;

    const completed = transaction && transaction.confirmations > 10;
    const response = { completed: !!completed, isValid: !!isValid };

    cacheSet(cacheKey, JSON.stringify(response), network, FIVE_MINUTES_IN_MS);
    return response;
  } catch (e) {
    logger.error(`Error fetching comment transcation: ${txHash}`);
    return {
      completed: false,
      isValid: false
    };
  }
}
