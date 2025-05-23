/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SkyLockedDelegateApiResponse } from '../types/delegate';
import { formatIsoDateConversion } from 'lib/datetime';
import { SKYWeightHisory } from '../types/skyWeight';
import { differenceInCalendarYears, subDays } from 'date-fns';

export const formatDelegationHistoryChart = (
  lockEvents: SkyLockedDelegateApiResponse[],
  from: number
): SKYWeightHisory[] => {
  //sort lock events by block number and add accumulated amount
  const lockEventsWithAccumulatedAmount = lockEvents
    .sort((a, b) => a.blockNumber - b.blockNumber)
    .reduce<Array<SkyLockedDelegateApiResponse & { accumulatedAmount: number }>>((acc, event, index) => {
      const previousAccumulatedAmount = index === 0 ? 0 : acc[index - 1].accumulatedAmount;
      const currentLockAmount = parseFloat(event.lockAmount);

      acc.push({
        ...event,
        accumulatedAmount: previousAccumulatedAmount + currentLockAmount
      });

      return acc;
    }, []);

  // We need to fill all the data for the interval
  // If we get last month, we need to add all the missing days

  const start = formatIsoDateConversion(lockEventsWithAccumulatedAmount[0].blockTimestamp);

  const years = differenceInCalendarYears(
    Date.now(),
    new Date(lockEventsWithAccumulatedAmount[0].blockTimestamp)
  );

  const end = years * 365 + formatIsoDateConversion(new Date().toISOString());

  const output: SKYWeightHisory[] = [];

  for (let i = start; i <= end; i++) {
    const existingItem = lockEventsWithAccumulatedAmount.filter(item => {
      const years = differenceInCalendarYears(
        new Date(item.blockTimestamp),
        new Date(lockEventsWithAccumulatedAmount[0].blockTimestamp)
      );
      const dayOfYear = formatIsoDateConversion(item.blockTimestamp);
      const dayNumber = dayOfYear + years * 365;
      if (dayNumber === i) {
        return item;
      }
    });

    if (existingItem && existingItem.length > 0) {
      // If we have multiple items for the same day, use the final one because the accumulatedAmount will be accurate.
      const mostRecent = existingItem[existingItem.length - 1];
      output.push({
        date: subDays(new Date(), end - i),
        SKY: mostRecent.accumulatedAmount
      });
    } else {
      output.push({
        date: subDays(new Date(), end - i),
        SKY: output[output.length - 1].SKY
      });
    }
  }

  // Filter by date
  return output.filter(i => {
    return i.date.getTime() > new Date(from).getTime();
  });
};
