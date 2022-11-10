import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { GASLESS_RATE_LIMIT_IN_MS } from 'modules/polling/polling.constants';

export async function recentlyUsedGaslessVotingCheck(
  voter: string,
  network: SupportedNetworks
): Promise<boolean> {
  const cacheKey = getRecentlyUsedGaslessVotingKey(voter);

  const recentlyUsedGaslessVoting = await cacheGet(cacheKey, network);
  const cacheExpired =
    recentlyUsedGaslessVoting && Date.now() - parseInt(recentlyUsedGaslessVoting) > GASLESS_RATE_LIMIT_IN_MS;
  return !!recentlyUsedGaslessVoting && !cacheExpired;
}
