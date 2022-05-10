import { fetchJson } from 'lib/fetchJson';
import { Delegate, DelegatesAPIStats } from 'modules/delegates/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchDelegates } from './fetchDelegates';

export type DelegatesPageData = {
  delegates: Delegate[];
  stats?: DelegatesAPIStats;
};

export async function fetchDelegatesPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<DelegatesPageData> {
  const { delegates, stats } = useApi
    ? await fetchJson(`/api/delegates?network=${network}`)
    : await fetchDelegates(network);

  return {
    delegates,
    stats
  };
}
