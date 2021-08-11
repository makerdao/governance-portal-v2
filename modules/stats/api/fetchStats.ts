import { SupportedNetworks } from 'lib/constants';
import { StatsAPIResponse } from '../types/statsApiResponse';

export function fetchStats(address: string, network: SupportedNetworks): Promise<StatsAPIResponse> {
  return Promise.resolve({
    metadata: {
      type: 'address',
      owner: ''
    },
    pagination: {
      page: 0,
      pageSize: 10,
      limit: 10
    },
    votes: [
      {
        date: Date.now(),
        address: '',
        value: 'yes'
      }
    ]
  });
}
