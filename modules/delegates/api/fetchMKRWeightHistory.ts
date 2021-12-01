import { SupportedNetworks } from 'lib/constants';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { MKRWeightHisory } from '../types/mkrWeight';
import getMaker from 'lib/maker';
import { format, parse } from 'date-fns';
import BigNumber from 'bignumber.js';
import { MKRLockedDelegateAPIResponse } from '../types';

export async function fetchDelegatesMKRWeightHistory(
  address: string,
  from: number,
  range: MKRWeightTimeRanges,
  network: SupportedNetworks
): Promise<MKRWeightHisory[]> {
  const maker = await getMaker(network);
  const addressData: MKRLockedDelegateAPIResponse[] = await maker
    .service('voteDelegate')
    .getMkrLockedDelegate(address);

  // We need to fill all the data for the interval
  // If we get last month, we need to add all the missing days
  const start = parseInt(
    format(new Date(addressData[0].blockTimestamp), 'D', {
      useAdditionalDayOfYearTokens: true
    })
  );

  const end = parseInt(
    format(new Date(), 'D', {
      useAdditionalDayOfYearTokens: true
    })
  );

  const output: MKRWeightHisory[] = [];

  for (let i = start; i <= end; i++) {
    const existingItem = addressData.find(item => {
      const day = parseInt(
        format(new Date(item.blockTimestamp), 'D', {
          useAdditionalDayOfYearTokens: true
        })
      );
      if (day === i) {
        return item;
      }
    });
    if (existingItem) {
      output.push({
        date: parse(i.toString(), 'D', new Date(existingItem.blockTimestamp), {
          useAdditionalDayOfYearTokens: true
        }),
        MKR: new BigNumber(existingItem.lockTotal).toNumber()
      });
    } else {
      output.push({
        date: parse(i.toString(), 'D', new Date(), {
          useAdditionalDayOfYearTokens: true
        }),
        MKR: output[output.length - 1].MKR
      });
    }
  }

  // Filter by date
  return output.filter(i => {
    return i.date.getTime() > new Date(from).getTime();
  });
}
