import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegateAddresses } from 'modules/gql/queries/subgraph/allDelegateAddresses';
import { allDelegateAddressesKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { AllDelegatesEntry } from '../types';
import { ONE_HOUR_IN_MS } from 'modules/app/constants/time';

export async function fetchDelegateAddresses(network: SupportedNetworks): Promise<AllDelegatesEntry[]> {
  const cachedResponse = await cacheGet(allDelegateAddressesKey, network);
  if (cachedResponse) return JSON.parse(cachedResponse);

  try {
    const chainId = networkNameToChainId(network);
    const allDelegatesData: AllDelegatesEntry[] = [];
    let skip = 0;
    const first = 1000;
    let hasMore = true;

    // Fetch all delegates using pagination
    while (hasMore) {
      const data = await gqlRequest<any>({
        chainId,
        query: allDelegateAddresses,
        useSubgraph: true,
        variables: { first, skip }
      });

      if (data.delegates && data.delegates.length > 0) {
        const batch = data.delegates.map((delegate: any) => ({
          delegate: delegate.ownerAddress,
          voteDelegate: delegate.id,
          blockTimestamp: new Date(Number(delegate.blockTimestamp) * 1000),
          delegateVersion: Number(delegate.version) || 1
        })) as AllDelegatesEntry[];
        
        allDelegatesData.push(...batch);
        skip += first;
        hasMore = data.delegates.length === first;
      } else {
        hasMore = false;
      }
    }

    cacheSet(allDelegateAddressesKey, JSON.stringify(allDelegatesData), network, ONE_HOUR_IN_MS);

    return allDelegatesData;
  } catch (e) {
    logger.error('fetchDelegateAddresses: Error fetching delegate addresses', e.message, 'Network', network);
    return [];
  }
}
