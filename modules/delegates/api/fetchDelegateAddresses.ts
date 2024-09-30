import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { Query } from 'modules/gql/generated/graphql';
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

    const data = await gqlRequest<Query>({
      chainId,
      query: allDelegates
    });
    const delegates = data.allDelegates.nodes.map(delegate => ({
      ...delegate,
      blockTimestamp: new Date(delegate?.blockTimestamp),
      delegate: delegate?.delegate,
      voteDelegate: delegate?.voteDelegate
    })) as AllDelegatesEntry[];

    cacheSet(allDelegateAddressesKey, JSON.stringify(delegates), network, ONE_HOUR_IN_MS);

    return delegates;
  } catch (e) {
    logger.error('fetchDelegateAddresses: Error fetching delegate addresses', e.message, 'Network', network);
    return [];
  }
}
