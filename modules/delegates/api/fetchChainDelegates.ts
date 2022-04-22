import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { DelegateContractInformation } from '../types';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { fetchDelegationEventsByAddresses } from './fetchDelegationEventsByAddresses';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const chainId = networkNameToChainId(network);
  const data = await gqlRequest({ chainId, query: allDelegates });

  const delegates = data.allDelegates.nodes;

  const contracts = getContracts(chainId);

  const delegatesWithMkrStaked: DelegateContractInformation[] = await Promise.all(
    delegates.map(async (delegate, index): Promise<DelegateContractInformation> => {
      // Get MKR delegated to each contract
      const mkr = await contracts.chief.deposits(delegate.voteDelegate);

      const delegationEvents = await fetchDelegationEventsByAddresses([delegate.voteDelegate], network);

      const chainDelegate: DelegateContractInformation = {
        ...delegate,
        address: delegate.delegate,
        voteDelegateAddress: delegate.voteDelegate,
        mkrDelegated: formatValue(mkr, 'wad', 18, false),
        mkrLockedDelegate: delegationEvents
      };

      return chainDelegate;
    })
  );

  return delegatesWithMkrStaked;
}
