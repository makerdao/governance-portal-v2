import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';
import { CurrencyObject } from 'modules/app/types/currency';
import { StakingHistoryRow } from 'modules/emergency-shutdown/types/esmodule';

export type ESModuleStats = [
  CurrencyObject,
  boolean,
  CurrencyObject,
  CurrencyObject | null,
  BigNumber | null,
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
    esmService.getStakingHistory()
  ]);
}
