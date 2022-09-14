import logger from 'lib/logger';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { mkrLockedDelegateArrayTotalsV2 } from 'modules/gql/queries/mkrLockedDelegateArray';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { MKRLockedDelegateAPIResponse } from '../types';

export async function fetchDelegationEventsByAddresses(
  addresses: string[],
  network: SupportedNetworks
): Promise<MKRLockedDelegateAPIResponse[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: mkrLockedDelegateArrayTotalsV2,
      variables: {
        argAddress: addresses,
        argUnixTimeStart: 0,
        argUnixTimeEnd: Math.floor(Date.now() / 1000)
      }
    });
    const addressData: MKRLockedDelegateAPIResponse[] = data.mkrLockedDelegateArrayTotalsV2.nodes;
    return addressData;
  } catch (e) {
    logger.error('fetchDelegationEventsByAddresses: Error fetching delegation events', e.message);
    return [];
  }
}
