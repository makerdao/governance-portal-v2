import { SupportedNetworks } from 'lib/constants';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { MKRWeightHisory } from '../types/mkrWeight';
import getMaker from 'lib/maker';
import { format, parse } from 'date-fns';
import BigNumber from 'bignumber.js';

/*function groupByRange(items: MKRLockedDelegate[], range: MKRWeightTimeRanges) {

  
  const groups = items.reduce((acc, item) => {

    // create a composed key: 'year-week' 
    let dateString = '';

    if (range === MKRWeightTimeRanges.week) {
      dateString = `${moment(item.blockTimestamp).year()}-${moment(item.blockTimestamp).week()}`;
    } else if (range === MKRWeightTimeRanges.month) {
      dateString = `${moment(item.blockTimestamp).year()}-${moment(item.blockTimestamp).month()}`;
    } else {
      dateString = `${moment(item.blockTimestamp).year()}-${moment(item.blockTimestamp).week()}-${moment(item.blockTimestamp).dayOfYear()}}`;
    }
    
    // add this key as a property to the result object
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    
    // push the current date that belongs to the year-week calculated befor
    acc[dateString].push(item);
  
    return acc;
  
  }, {});

  const reducedItems = Object.keys(groups).map(key => {
    const = totalMkr
    return {
      date: key,
      MKR: 
    }
  })


} */

type MKRLockedDelegate = {
  fromAddress: string;
  lockAmount: string;
  blockNumber: number;
  blockTimestamp: string;
  lockTotal: string;
};

export async function fetchDelegatesMKRWeightHistory(
  address: string,
  from: number,
  range: MKRWeightTimeRanges,
  network: SupportedNetworks
): Promise<MKRWeightHisory[]> {
  const maker = await getMaker(network);
  const addressData: MKRLockedDelegate[] = await maker.service('voteDelegate').getMkrLockedDelegate(address);
  // const addressData = mockAddressData

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
        MKR: new BigNumber(existingItem.lockTotal).toNumber(),
        averageMKRDelegated: 1000
      });
    } else {
      output.push({
        date: parse(i.toString(), 'D', new Date(), {
          useAdditionalDayOfYearTokens: true
        }),
        MKR: output[output.length - 1].MKR,
        averageMKRDelegated: 1000
      });
    }
  }

  // Filter by date
  return output.filter(i => {
    return i.date.getTime() > new Date(from).getTime();
  });
  // const grouppedData = range === MKRWeightTimeRanges.week ? groupByWeek(addressData)
  // TODO : Complete with maker data
  // return Promise.resolve(range === MKRWeightTimeRanges.month ? dataYear : dataWeek);
}
