import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export async function recentlyUsedGaslessVotingCheck(
  voter: string,
  network: SupportedNetworks
): Promise<boolean> {
  const cacheKey = getRecentlyUsedGaslessVotingKey(voter);

  const recentlyUsedGaslessVoting = await cacheGet(cacheKey, network);

  return !!recentlyUsedGaslessVoting;
}
