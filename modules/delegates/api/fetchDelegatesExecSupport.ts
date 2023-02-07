import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { Query } from 'modules/gql/generated/graphql';
import { allDelegatesExecSupportKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { DelegateExecSupport } from '../types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';

export async function fetchDelegatesExecSupport(network: SupportedNetworks): Promise<{
  error: boolean;
  data?: DelegateExecSupport[];
}> {
  const cachedResponse = await cacheGet(allDelegatesExecSupportKey, network);
  if (cachedResponse) {
    console.log('Executing cache');
    return {
      error: false,
      data: JSON.parse(cachedResponse)
    };
  }
  console.log('Not executing cache');

  try {
    const chainId = networkNameToChainId(network);

    const data = await gqlRequest<Query>({ chainId, query: allDelegates });
    const delegates = data.allDelegates.nodes;

    const contracts = getContracts(chainId, undefined, undefined, true);
    const delegatesExecSupport = await Promise.all(
      delegates.map(async delegate => {
        if (delegate?.voteDelegate) {
          const votedSlate = await contracts.chief.votes(delegate.voteDelegate);
          const votedProposals =
            votedSlate !== ZERO_SLATE_HASH ? await getSlateAddresses(contracts.chief, votedSlate) : [];

          return {
            voteDelegate: delegate.voteDelegate,
            votedProposals
          };
        }

        return delegate as DelegateExecSupport;
      })
    );

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
