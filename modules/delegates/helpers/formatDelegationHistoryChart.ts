import { DelegationHistory } from '../types/delegate';
import { MKRLockedDelegateAPIResponse } from '../types/delegatesAPI';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatIsoDateConversion } from 'lib/datetime';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { MKRWeightHisory } from '../types/mkrWeight';
import { format } from 'date-fns';
import BigNumber from 'bignumber.js';
import { differenceInCalendarYears, subDays } from 'date-fns';

// Time ranges
const oneDay = 24 * 60 * 60 * 1000;
const oneYear = 365 * oneDay;
const oneMonth = 31 * oneDay;
const oneWeek = 7 * oneDay;

const dateFormat = 'MM-dd-yyyy';

const timeRanges = [
  {
    label: 'Last year',
    from: Date.now() - oneYear,
    range: MKRWeightTimeRanges.month,
    interval: 30
  },
  {
    label: 'Last month',
    from: Date.now() - oneMonth,
    range: MKRWeightTimeRanges.day,
    interval: 7
  },
  {
    label: 'Last week',
    from: Date.now() - oneWeek,
    range: MKRWeightTimeRanges.day,
    interval: 1
  }
];

export const formatDelegationHistoryChart = (
  lockEvents: MKRLockedDelegateAPIResponse[],
  address: string,
  from: number,
  range: MKRWeightTimeRanges,
  network: SupportedNetworks
): DelegationHistory[] => {
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
      // If we have multiple items for the same day, use the final one because the lockTotal will be accurate.
      const mostRecent = existingItem[existingItem.length - 1];
      output.push({
        date: subDays(new Date(), end - i),
        MKR: new BigNumber(mostRecent.lockTotal).toNumber()
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
