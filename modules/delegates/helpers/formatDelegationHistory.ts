import { utils } from 'ethers';
import { DelegationHistory, MKRLockedDelegateAPIResponse } from '../types/delegate';

export const formatDelegationHistory = (lockEvents: MKRLockedDelegateAPIResponse[]): DelegationHistory[] => {
  const delegators = lockEvents.reduce<DelegationHistory[]>(
    (acc, { immediateCaller, lockAmount, blockTimestamp, hash }) => {
      const existing = acc.find(({ address }) => address === immediateCaller);
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
        existing.events.push({ lockAmount, blockTimestamp, hash });
      } else {
        acc.push({
          address: immediateCaller,
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
