import { fetchJson } from 'lib/fetchJson';
import { TagCount } from 'modules/app/types/tag';
import { Delegate, DelegatesAPIStats } from 'modules/delegates/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchDelegates } from './fetchDelegates';

export type DelegatesPageData = {
  delegates: Delegate[];
  stats?: DelegatesAPIStats;
  tags: TagCount[];
};

export async function fetchDelegatesPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<DelegatesPageData> {
  const { delegates, stats } = useApi
    ? await fetchJson(`/api/delegates?network=${network}`)
    : await fetchDelegates(network);

  // Aggregate delegates by tags
  const tags = delegates.reduce((acc, cur) => {
    if (!cur.tags) return acc;
    cur.tags.forEach(c => {
      const prev = acc.findIndex(t => t.id === c.id);

      if (prev !== -1) {
        acc[prev].count += 1;
      } else {
        acc.push({
          ...c,
          count: 1
        });
      }
    });
    return acc;
  }, [] as TagCount[]);

  return {
    delegates,
    stats,
    tags
  };
}
