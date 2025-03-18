import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/subgraph/allDelegates';
import { allDelegatesExecSupportKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { DelegateExecSupport } from '../types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

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
    const publicClient = getPublicClient(chainId);

    const data = await gqlRequest({
      chainId,
      useSubgraph: true,
      query: allDelegates
    });
    const delegates = data.delegates;

    const delegatesExecSupport = await Promise.all(
      delegates.map(async delegate => {
        if (delegate?.id) {
          const votedSlate = await publicClient.readContract({
            address: chiefAddress[chainId],
            abi: chiefAbi,
            functionName: 'votes',
            args: [delegate.id]
          });
          const votedProposals =
            votedSlate !== ZERO_SLATE_HASH
              ? await getSlateAddresses(chainId, chiefAddress[chainId], chiefAbi, votedSlate)
              : [];

          return {
            voteDelegate: delegate.id,
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
