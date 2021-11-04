import { SupportedNetworks } from 'lib/constants';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { MKRWeightHisory } from '../types/mkrWeight';
import getMaker from 'lib/maker';
import moment from 'moment';
import BigNumber from 'bignumber.js';

const dataYear = [
  {
    date: 'Jan',
    MKR: 4000,
    averageMKRDelegated: 2400
  },
  {
    date: 'Feb',
    MKR: 3600,
    averageMKRDelegated: 2000
  },
  {
    date: 'March',
    MKR: 3000,
    averageMKRDelegated: 2400
  },
  {
    date: 'April',
    MKR: 3100,
    averageMKRDelegated: 2000
  },
  {
    date: 'May',
    MKR: 4000,
    averageMKRDelegated: 3000
  },
  {
    date: 'Jun',
    MKR: 4500,
    averageMKRDelegated: 3500
  },
  {
    date: 'Aug',
    MKR: 3000,
    averageMKRDelegated: 5000
  },
  {
    date: 'Sept',
    MKR: 7000,
    averageMKRDelegated: 20000
  },
  {
    date: 'Dec',
    MKR: 10000,
    averageMKRDelegated: 25000
  }
];

const dataWeek = [
  {
    date: '21 septs ',
    MKR: 241,
    averageMKRDelegated: 5124
  },
  {
    date: '22 Sept',
    MKR: 1231,
    averageMKRDelegated: 12312
  },
  {
    date: '23 Sept',
    MKR: 1231,
    averageMKRDelegated: 52314
  },
  {
    date: '24 Sept',
    MKR: 2134,
    averageMKRDelegated: 21312
  },
  {
    date: '25 Sept',
    MKR: 56445,
    averageMKRDelegated: 45645
  }
];

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

const mockAddressData: MKRLockedDelegate[] = [
  {
    fromAddress: '0xd790a1516f78e3fb52338084b5c5931a75bb19cf',
    lockAmount: '32.000000000000000000',
    blockNumber: 12940153,
    blockTimestamp: '2021-08-01T14:22:00+00:00',
    lockTotal: '32.000000000000000000'
  },
  {
    fromAddress: '0x4f2161c7eb1dc40d6f0eb24db81bf4a6eb0c3f30',
    lockAmount: '1.000000000000000000',
    blockNumber: 12950701,
    blockTimestamp: '2021-08-03T06:23:52+00:00',
    lockTotal: '33.000000000000000000'
  },
  {
    fromAddress: '0x4f2161c7eb1dc40d6f0eb24db81bf4a6eb0c3f30',
    lockAmount: '-1.000000000000000000',
    blockNumber: 12950758,
    blockTimestamp: '2021-08-03T06:36:45+00:00',
    lockTotal: '32.000000000000000000'
  },
  {
    fromAddress: '0x4f2161c7eb1dc40d6f0eb24db81bf4a6eb0c3f30',
    lockAmount: '8000.000000000000000000',
    blockNumber: 12972118,
    blockTimestamp: '2021-08-06T15:07:57+00:00',
    lockTotal: '8032.000000000000000000'
  },
  {
    fromAddress: '0xc0583df0d10c2e87ae1873b728a0bda04d8b660c',
    lockAmount: '17000.000000000000000000',
    blockNumber: 13094245,
    blockTimestamp: '2021-08-25T11:14:17+00:00',
    lockTotal: '25032.000000000000000000'
  }
];

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
  const start = moment(addressData[0].blockTimestamp).dayOfYear();
  const end = moment(addressData[addressData.length - 1].blockTimestamp).dayOfYear();
  const output = [];

  for (let i = start; i <= end; i++) {
    const existingItem = addressData.find(item => {
      const day = moment(item.blockTimestamp).dayOfYear();
      if (day === i) {
        return item;
      }
    });
    if (existingItem) {
      output.push({
        date: moment(existingItem.blockTimestamp),
        MKR: new BigNumber(existingItem.lockTotal).toNumber(),
        averageMKRDelegated: 1000
      });
    } else {
      output.push({
        date: moment().dayOfYear(i),
        MKR: output[output.length - 1].MKR,
        averageMKRDelegated: 1000
      });
    }
  }

  return output;
  // const grouppedData = range === MKRWeightTimeRanges.week ? groupByWeek(addressData)
  // TODO : Complete with maker data
  // return Promise.resolve(range === MKRWeightTimeRanges.month ? dataYear : dataWeek);
}
