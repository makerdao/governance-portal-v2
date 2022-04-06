import { formatValue } from 'lib/string';
import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { useMkrOnHat } from 'modules/executive/hooks/useMkrOnHat';

export function GovernanceStats(): JSX.Element {
  const { data: mkrOnHat } = useMkrOnHat();
  // const { data: daiSavingsRate } = useDaiSavingsRate();
  // const { data: systemSurplus } = useSystemSurplus();
  // const { data: debtCeiling } = useSystemWideDebtCeiling();

  // TODO get live data

  const infoUnits = [
    {
      title: 'MKR on Hat',
      value: mkrOnHat ? `${formatValue(mkrOnHat)} MKR` : <Skeleton />
    },
    {
      title: 'Active Proposals',
      // value: true ? `9` : <Skeleton />
      value: '9'
    },
    {
      title: 'Recognized Delegates',
      // value: true ? '17' : <Skeleton />
      value: '17'
    },
    {
      title: 'Shadow Delegates',
      // value: true ? '9' : <Skeleton />
      value: '9'
    },
    {
      title: 'MKR Delegated',
      // value: true ? '89,234' : <Skeleton />
      value: '89,234'
    },
    {
      title: 'MKR in Chief',
      // value: true ? '132,023 MKR' : <Skeleton />
      value: '132,023 MKR'
    }
  ];

  return <Stats title="Governance Stats" infoUnits={infoUnits} />;
}
