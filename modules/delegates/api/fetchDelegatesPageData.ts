/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { TagCount } from 'modules/app/types/tag';
import { Delegate, DelegatesAPIStats } from 'modules/delegates/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchDelegates } from './fetchDelegates';
import { CvcAndCount } from 'modules/delegates/types/cvc';

export type DelegatesPageData = {
  delegates: Delegate[];
  stats?: DelegatesAPIStats;
  cvcs: CvcAndCount[];
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

  // Aggregate delegates by CVCs
  function getCvcCounts(delegates: Delegate[]): CvcAndCount[] {
    const counts: { [key: string]: number } = {};
    
    // Count the number of delegates with each cvc_name
    delegates.forEach(delegate => {
      if (delegate.cvc_name !== undefined) {
        if (counts[delegate.cvc_name] === undefined) {
          counts[delegate.cvc_name] = 0;
        }
        counts[delegate.cvc_name]++;
      }
    });
    
    // Convert the counts object to an array of CvcCounts
    const result: CvcAndCount[] = [];
    Object.entries(counts).forEach(([cvc_name, count]) => {
      result.push({ cvc_name, count });
    });
    
    return result;
  }

  return {
    delegates,
    stats,
    cvcs: getCvcCounts(delegates)
  };
}
