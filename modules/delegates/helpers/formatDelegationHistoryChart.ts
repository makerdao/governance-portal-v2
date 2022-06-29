import { MKRLockedDelegateAPIResponse } from '../types/delegate';
import { formatIsoDateConversion } from 'lib/datetime';
import { MKRWeightHisory } from '../types/mkrWeight';
import { format } from 'date-fns';
import BigNumber from 'lib/bigNumberJs';
import { differenceInCalendarYears, subDays } from 'date-fns';

export const formatDelegationHistoryChart = (
  lockEvents: MKRLockedDelegateAPIResponse[],
  from: number
): MKRWeightHisory[] => {
  // We need to fill all the data for the interval
  // If we get last month, we need to add all the missing days
  const start = formatIsoDateConversion(lockEvents[0].blockTimestamp);

  const years = differenceInCalendarYears(Date.now(), new Date(lockEvents[0].blockTimestamp));

  const end =
    years * 365 +
    parseInt(
      format(new Date(), 'D', {
        useAdditionalDayOfYearTokens: true
      })
    );

  const output: MKRWeightHisory[] = [];

  for (let i = start; i <= end; i++) {
    const existingItem = lockEvents.filter(item => {
      const years = differenceInCalendarYears(
        new Date(item.blockTimestamp),
        new Date(lockEvents[0].blockTimestamp)
      );
      const dayOfYear = formatIsoDateConversion(item.blockTimestamp);
      const dayNumber = dayOfYear + years * 365;
      if (dayNumber === i) {
        return item;
      }
    });

    if (existingItem && existingItem.length > 0) {
      // If we have multiple items for the same day, use the final one because the callerLockTotal will be accurate.
      const mostRecent = existingItem[existingItem.length - 1];
      output.push({
        date: subDays(new Date(), end - i),
        MKR: new BigNumber(mostRecent.callerLockTotal).toNumber()
      });
    } else {
      output.push({
        date: subDays(new Date(), end - i),
        MKR: output[output.length - 1].MKR
      });
    }
  }

  // Filter by date
  return output.filter(i => {
    return i.date.getTime() > new Date(from).getTime();
  });
};
