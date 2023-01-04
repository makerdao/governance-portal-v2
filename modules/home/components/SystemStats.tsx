/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Skeleton from 'modules/app/components/SkeletonThemed';
import { Stats } from 'modules/home/components/Stats';
import { useTotalDai } from 'modules/web3/hooks/useTotalDai';
import { useDaiSavingsRate } from 'modules/web3/hooks/useDaiSavingsRate';
import { useSystemSurplus } from 'modules/web3/hooks/useSystemSurplus';
import { useSystemWideDebtCeiling } from 'modules/web3/hooks/useSystemWideDebtCeiling';
import { formatValue } from 'lib/string';

export function SystemStats(): JSX.Element {
  const { data: totalDai } = useTotalDai();
  const { data: daiSavingsRate } = useDaiSavingsRate();
  const { data: systemSurplus } = useSystemSurplus();
  const { data: debtCeiling } = useSystemWideDebtCeiling();

  const infoUnits = [
    {
      title: 'Dai Savings Rate',
      value: daiSavingsRate ? `${daiSavingsRate.toFixed(2)}%` : <Skeleton />
    },
    {
      title: 'Total Dai',
      value: totalDai ? `${formatValue(totalDai, 'rad')} DAI` : <Skeleton />
    },
    {
      title: 'Dai Debt Ceiling',
      value: debtCeiling ? `${formatValue(debtCeiling, 'rad')} DAI` : <Skeleton />
    },
    {
      title: 'System Surplus',
      value: systemSurplus ? `${formatValue(systemSurplus, 'rad')} DAI` : <Skeleton />
    }
  ];

  return <Stats title="System Stats" infoUnits={infoUnits} viewMoreUrl="https://daistats.com/" />;
}
