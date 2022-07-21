import { ethers } from 'ethers';
import logger from 'lib/logger';
import { FIVE_MINUTES_IN_MS } from 'modules/app/constants/time';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export const getCommentTransaction = async (
  network: SupportedNetworks,
  provider: ethers.providers.JsonRpcProvider,
  txHash?: string
) => {
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

    return transaction;
  } catch (e) {
    logger.error(`Error fetching comment transcation: ${txHash}`);
  }
};
