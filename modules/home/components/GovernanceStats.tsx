/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { DelegatesApiStats } from 'modules/delegates/types';
import { PollsResponse } from 'modules/polling/types/pollsResponse';
import { formatValue } from 'lib/string';

type Props = {
  pollStats: PollsResponse['stats'];
  stats?: DelegatesApiStats;
  skyOnHat?: string;
  skyInChief?: string;
};

export function GovernanceStats({ pollStats, stats, skyOnHat, skyInChief }: Props): JSX.Element {
  const infoUnits = [
    {
      title: 'SKY on Hat',
      value: skyOnHat ? `${skyOnHat} SKY` : <Skeleton />
    },
    {
      title: 'Active Polls',
      value: pollStats ? pollStats.active.toString() : <Skeleton />
    },
    {
      title: 'Aligned Delegates',
      value: stats ? stats.aligned.toString() : <Skeleton />
    },
    {
      title: 'Shadow Delegates',
      value: stats ? stats.shadow.toString() : <Skeleton />
    },
    {
      title: 'SKY Delegated',
      value: stats ? (
        `${formatValue(BigInt(Math.floor(parseFloat(stats.totalSkyDelegated))), 0, 2, true, false, 1e9)} SKY`
      ) : (
        <Skeleton />
      )
    },
    {
      title: 'SKY in Chief',
      value: skyInChief ? `${skyInChief} SKY` : <Skeleton />
    }
  ];

  return <Stats title="Governance Stats" infoUnits={infoUnits} viewMoreUrl="" />;
}
