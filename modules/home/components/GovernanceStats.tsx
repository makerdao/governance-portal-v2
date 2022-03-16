import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
// import { formatValue } from 'lib/string';

export function GovernanceStats(): JSX.Element {
  // const { data: totalDai } = useTotalDai();
  // const { data: daiSavingsRate } = useDaiSavingsRate();
  // const { data: systemSurplus } = useSystemSurplus();
  // const { data: debtCeiling } = useSystemWideDebtCeiling();

  // TODO get live data

  const infoUnits = [
    {
      title: 'MKR on Hat',
      value: true ? '76,234 MKR' : <Skeleton />
    },
    {
      title: 'Active Proposals',
      value: true ? `9` : <Skeleton />
    },
    {
      title: 'Recognized Delegates',
      value: true ? '17' : <Skeleton />
    },
    {
      title: 'Shadow Delegates',
      value: true ? '9' : <Skeleton />
    },
    {
      title: 'MKR Delegated',
      value: true ? '89,234' : <Skeleton />
    },
    {
      title: 'MKR in Chief',
      value: true ? '132,023 MKR' : <Skeleton />
    }
  ];

  return <Stats title="Governance Stats" infoUnits={infoUnits} />;
}
