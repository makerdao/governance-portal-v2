import { gqlRequest } from 'modules/gql/gqlRequest';
import { mkrLockedDelegateArray } from 'modules/gql/queries/mkrLockedDelegateArray';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { MKRLockedDelegateAPIResponse } from '../types/delegatesAPI';

export async function fetchDelegationEventsByAddresses(
  addresses: string[],
  network: SupportedNetworks
): Promise<MKRLockedDelegateAPIResponse[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: mkrLockedDelegateArray,
      variables: {
        argAddress: addresses,
        argUnixTimeStart: 0,
        argUnixTimeEnd: Math.floor(Date.now() / 1000)
      }
    });

    const addressData: MKRLockedDelegateAPIResponse[] = data.mkrLockedDelegateArray.nodes;

    return addressData;
  } catch (e) {
    console.error('Error fetching delegation events', e.message);
    return [];
  }
}
