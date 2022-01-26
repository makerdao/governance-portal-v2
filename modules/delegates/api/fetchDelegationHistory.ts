import { utils } from 'ethers';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { mkrLockedDelegate } from 'modules/gql/queries/mkrLockedDelegate';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { DelegationHistory } from '../types/delegate';
import { MKRLockedDelegateAPIResponse } from '../types/delegatesAPI';

export async function fetchDelegationHistory(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: mkrLockedDelegate,
      variables: { argAddress: address, argUnixTimeStart: 0, argUnixTimeEnd: Math.floor(Date.now() / 1000) }
    });

    const addressData: MKRLockedDelegateAPIResponse[] = data.mkrLockedDelegate.nodes;

    const delegators = addressData.reduce<DelegationHistory[]>(
      (acc, { fromAddress, lockAmount, blockTimestamp, hash }) => {
        const existing = acc.find(({ address }) => address === fromAddress);
        if (existing) {
          existing.lockAmount = utils.formatEther(
            utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
          );
          existing.events.push({ lockAmount, blockTimestamp, hash });
        } else {
          acc.push({
            address: fromAddress,
            lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
            events: [{ lockAmount, blockTimestamp, hash }]
          });
        }

        return acc;
      },
      []
    );

    return delegators.sort((a, b) =>
      utils.parseEther(a.lockAmount).gt(utils.parseEther(b.lockAmount)) ? -1 : 1
    );
  } catch (e) {
    console.error('Error fetching delegation history', e.message);
    return [];
  }
}
