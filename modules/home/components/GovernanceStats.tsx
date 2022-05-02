import { useMemo } from 'react';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { BigNumber } from 'ethers';
import { formatValue } from 'lib/string';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { Poll } from 'modules/polling/types';
import { Delegate } from 'modules/delegates/types';
import { isActivePoll } from 'modules/polling/helpers/utils';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';

type Props = {
  polls: Poll[];
  delegates: Delegate[];
  totalMKRDelegated: string;
  mkrOnHat?: BigNumber;
  mkrInChief?: BigNumber;
};

export function GovernanceStats({
  polls,
  delegates,
  totalMKRDelegated,
  mkrOnHat,
  mkrInChief
}: Props): JSX.Element {
  const activePollCount = useMemo(() => polls.filter(poll => isActivePoll(poll)).length, [polls]);
  const recognizedDelegateCount = delegates.filter(
    delegate => delegate.status === DelegateStatusEnum.recognized
  ).length;
  const shadowDelegateCount = delegates.filter(
    delegate => delegate.status === DelegateStatusEnum.shadow
  ).length;

  const infoUnits = [
    {
      title: 'MKR on Hat',
      value: mkrOnHat ? `${formatValue(mkrOnHat)} MKR` : <Skeleton />
    },
    {
      title: 'Active Polls',
      value: polls ? activePollCount.toString() : <Skeleton />
    },
    {
      title: 'Recognized Delegates',
      value: delegates ? recognizedDelegateCount.toString() : <Skeleton />
    },
    {
      title: 'Shadow Delegates',
      value: delegates ? shadowDelegateCount.toString() : <Skeleton />
    },
    {
      title: 'MKR Delegated',
      value: totalMKRDelegated ? `${new BigNumberJS(totalMKRDelegated).toFormat(0)} MKR` : <Skeleton />
    },
    {
      title: 'MKR in Chief',
      value: mkrInChief ? `${formatValue(mkrInChief)} MKR` : <Skeleton />
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
