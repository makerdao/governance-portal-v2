import { utils } from 'ethers';
import { SupportedNetworks } from 'lib/constants';
import { DelegationHistory, MKRLockedDelegateAPIResponse } from '../types';
import getMaker from 'lib/maker';

export async function fetchDelegationHistory(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);
  const addressData: MKRLockedDelegateAPIResponse[] = await maker
    .service('voteDelegate')
    .getMkrLockedDelegate(address);

  const delegators = addressData.reduce<DelegationHistory[]>(
    (acc, { fromAddress, lockAmount, blockTimestamp }) => {
      const existing = acc.find(({ address }) => address === fromAddress);
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
        existing.events.push({ lockAmount, blockTimestamp });
      } else {
        acc.push({
          address: fromAddress,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
          events: [{ lockAmount, blockTimestamp }]
        });
      }

      return acc;
    },
    []
  );

  const delegateD: MKRLockedDelegateAPIResponse[] = await maker
    .service('voteDelegate')
    .getMkrDelegatedTo('0xc0583df0d10c2e87ae1873b728a0bda04d8b660c');

  const reddelegateD = delegateD.reduce(
    (acc, { fromAddress, immediateCaller, lockAmount, blockTimestamp }) => {
      const existing = acc.find(({ address }) => address === immediateCaller);
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount))
        });
      }

      return acc;
    },
    []
  );

  console.log('got reddelegateD:', reddelegateD);

  return delegators.sort((a, b) =>
    utils.parseEther(a.lockAmount).gt(utils.parseEther(b.lockAmount)) ? -1 : 1
  );
}
