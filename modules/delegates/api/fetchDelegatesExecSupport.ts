import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegatesExecSupport } from 'modules/gql/queries/subgraph/allDelegatesExecSupport';
import { allDelegatesExecSupportKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { DelegateExecSupport } from '../types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';

export async function fetchDelegatesExecSupport(network: SupportedNetworks): Promise<{
  error: boolean;
  data?: DelegateExecSupport[];
}> {
  const cachedResponse = await cacheGet(allDelegatesExecSupportKey, network);
  if (cachedResponse) {
    return {
      error: false,
      data: JSON.parse(cachedResponse)
    };
  }

  try {
    const chainId = networkNameToChainId(network);

    const data = await gqlRequest({
      chainId,
      query: allDelegatesExecSupport
    });

    const delegatesExecSupport: DelegateExecSupport[] = data.delegates.map(delegate => ({
      voteDelegate: delegate.id,
      votedProposals: delegate.voter.currentSpells.map(spell => spell.id)
    }));

    cacheSet(allDelegatesExecSupportKey, JSON.stringify(delegatesExecSupport), network, TEN_MINUTES_IN_MS);

    return {
      error: false,
      data: delegatesExecSupport
    };
  } catch (e) {
    logger.error(
      'fetchDelegatesExecSupport: Error fetching delegates executive support',
      e.message,
      'Network',
      network
    );
    return { error: true };
  }
}
