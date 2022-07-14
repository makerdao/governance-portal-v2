import { useMemo } from 'react';
import { BigNumberJS } from 'lib/bigNumberJs';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { Poll } from 'modules/polling/types';
import { DelegatesAPIStats } from 'modules/delegates/types';
import { isActivePoll } from 'modules/polling/helpers/utils';

type Props = {
  polls: Poll[];
  stats?: DelegatesAPIStats;
  mkrOnHat?: string;
  mkrInChief?: string;
};

export function GovernanceStats({ polls, stats, mkrOnHat, mkrInChief }: Props): JSX.Element {
  const activePollCount = useMemo(() => polls.filter(poll => isActivePoll(poll)).length, [polls]);

  const infoUnits = [
    {
      title: 'MKR on Hat',
      value: mkrOnHat ? `${mkrOnHat} MKR` : <Skeleton />
    },
    {
      title: 'Active Polls',
      value: polls ? activePollCount.toString() : <Skeleton />
    },
    {
      title: 'Recognized Delegates',
      value: stats ? stats.recognized.toString() : <Skeleton />
    },
    {
      title: 'Shadow Delegates',
      value: stats ? stats.shadow.toString() : <Skeleton />
    },
    {
      title: 'MKR Delegated',
      value: stats ? `${new BigNumberJS(stats.totalMKRDelegated).toFormat(0)} MKR` : <Skeleton />
    },
    {
      title: 'MKR in Chief',
      value: mkrInChief ? `${mkrInChief} MKR` : <Skeleton />
    }
  ];

  return (
    <Stats
      title="Governance Stats"
      infoUnits={infoUnits}
      viewMoreUrl="https://governance-metrics-dashboard.vercel.app/"
    />
  );
}
