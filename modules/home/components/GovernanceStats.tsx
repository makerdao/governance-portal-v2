/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { DelegatesAPIStats } from 'modules/delegates/types';
import { PollsResponse } from 'modules/polling/types/pollsResponse';

type Props = {
  pollStats: PollsResponse['stats'];
  stats?: DelegatesAPIStats;
  mkrInChief?: string;
};

export function GovernanceStats({ pollStats, stats, mkrInChief }: Props): JSX.Element {
  const infoUnits = [
    {
      title: 'Active Polls',
      value: pollStats ? pollStats.active.toString() : <Skeleton />
    },
    {
      title: 'MKR Delegated',
      value: stats ? (
        `${Number(stats.totalMKRDelegated).toLocaleString(undefined, { maximumFractionDigits: 0 })} MKR`
      ) : (
        <Skeleton />
      )
    },
    {
      title: 'MKR in Chief',
      value: mkrInChief ? `${mkrInChief} MKR` : <Skeleton />
    }
  ];

  return <Stats title="Governance Stats" infoUnits={infoUnits} viewMoreUrl="" />;
}
