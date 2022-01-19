import { utils } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DelegationHistory } from '../types/delegate';
import { MKRLockedDelegateAPIResponse } from '../types/delegatesAPI';
import getMaker from 'lib/maker';

export async function fetchDelegationHistory(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);
  try {
    const addressData: MKRLockedDelegateAPIResponse[] = await maker
      .service('voteDelegate')
      .getMkrLockedDelegate(address);

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
