import { SupportedNetworks } from 'lib/constants';
import { MKRWeightTimeRanges } from '../delegates.constants';
import { MKRWeightHisory } from '../types/mkrWeight';

const dataYear = [{
  date: 'Jan',
  MKR: 4000,
  averageMKRDelegated: 2400,
},
{
  date: 'Feb',
  MKR: 3600,
  averageMKRDelegated: 2000,
},
{
  date: 'March',
  MKR: 3000,
  averageMKRDelegated: 2400,
}, {
  date: 'April',
  MKR: 3100,
  averageMKRDelegated: 2000,
}, {
  date: 'May',
  MKR: 4000,
  averageMKRDelegated: 3000,
}, {
  date: 'Jun',
  MKR: 4500,
  averageMKRDelegated: 3500,
}, {
  date: 'Aug',
  MKR: 3000,
  averageMKRDelegated: 5000,
}, {
  date: 'Sept',
  MKR: 7000,
  averageMKRDelegated: 20000,
}, {
  date: 'Dec',
  MKR: 10000,
  averageMKRDelegated: 25000,
}];


const dataWeek = [{
  date: '21 sept ',
  MKR: 241,
  averageMKRDelegated: 5124,
},
{
  date: '22 Sept',
  MKR: 1231,
  averageMKRDelegated: 12312,
},
{
  date: '23 Sept',
  MKR: 1231,
  averageMKRDelegated: 52314,
}, {
  date: '24 Sept',
  MKR: 2134,
  averageMKRDelegated: 21312,
}, {
  date: '25 Sept',
  MKR: 56445,
  averageMKRDelegated: 45645,
}];

export async function fetchDelegatesMKRWeightHistory(from: number, range: MKRWeightTimeRanges, network: SupportedNetworks): Promise<MKRWeightHisory[]> {
  // TODO : Complete with maker data
  return Promise.resolve(range === MKRWeightTimeRanges.month ? dataYear : dataWeek);
}