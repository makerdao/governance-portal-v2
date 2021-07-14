import getMaker from 'lib/maker';
import { CurrencyObject } from 'types/currency';
import { StakingHistoryRow } from 'types/esmodule';

export type ESModuleStats = [
  CurrencyObject,
  boolean,
  CurrencyObject,
  CurrencyObject | null,
  Date | null,
  CurrencyObject | null,
  StakingHistoryRow[] | undefined
];

export async function fetchESModuleStats(address?: string): Promise<ESModuleStats> {
  const maker = await getMaker();
  const esmService = await maker.service('esm');

  return Promise.all([
    esmService.getTotalStaked(),
    esmService.canFire(),
    esmService.thresholdAmount(),
    address ? esmService.getTotalStakedByAddress(address) : null,
    maker.service('smartContract').getContract('END').when(),
    address ? maker.service('chief').getNumDeposits(address) : null,
    maker.service('esm').getStakingHistory()
  ]);
}
