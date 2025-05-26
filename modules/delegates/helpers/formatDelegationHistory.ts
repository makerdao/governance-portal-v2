/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { formatEther, parseEther } from 'viem';
import { DelegationHistory, SkyLockedDelegateApiResponse } from '../types/delegate';

export const formatDelegationHistory = (lockEvents: SkyLockedDelegateApiResponse[]): DelegationHistory[] => {
  const delegators = lockEvents.reduce<DelegationHistory[]>(
    (acc, { immediateCaller, lockAmount, blockTimestamp, hash, isStakingEngine }) => {
      const existing = acc.find(({ address }) => address === immediateCaller);
      if (existing) {
        existing.lockAmount = formatEther(parseEther(existing.lockAmount) + parseEther(lockAmount));
        existing.events.push({ lockAmount, blockTimestamp, hash, isStakingEngine });
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: formatEther(parseEther(lockAmount)),
          events: [{ lockAmount, blockTimestamp, hash, isStakingEngine }]
        });
      }

      return acc;
    },
    []
  );

  return delegators.sort((a, b) => (parseEther(a.lockAmount) > parseEther(b.lockAmount) ? -1 : 1));
};
