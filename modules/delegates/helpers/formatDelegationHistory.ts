import { utils } from 'ethers';
import { DelegationHistory } from '../types/delegate';
import { MKRLockedDelegateAPIResponse } from '../types/delegatesAPI';

export const formatDelegationHistory = (lockEvents: MKRLockedDelegateAPIResponse[]): DelegationHistory[] => {
  const delegators = lockEvents.reduce<DelegationHistory[]>(
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
};
