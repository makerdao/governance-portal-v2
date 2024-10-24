/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { utils } from 'ethers';
import { DelegationHistory, MKRLockedDelegateAPIResponse } from '../types/delegate';

export const formatDelegationHistory = (lockEvents: MKRLockedDelegateAPIResponse[]): DelegationHistory[] => {
  const delegators = lockEvents.reduce<DelegationHistory[]>(
    (acc, { immediateCaller, lockAmount, blockTimestamp, hash, isLockstake }) => {
      const existing = acc.find(({ address }) => address === immediateCaller);
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
        existing.events.push({ lockAmount, blockTimestamp, hash, isLockstake });
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
          events: [{ lockAmount, blockTimestamp, hash, isLockstake }]
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
