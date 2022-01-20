import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';
import { CurrencyObject } from 'modules/app/types/currency';

export type ESModuleStats = [boolean, CurrencyObject | null, BigNumber | null, CurrencyObject | null];

export async function fetchESModuleStats(address?: string): Promise<ESModuleStats> {
  const maker = await getMaker();
  const esmService = await maker.service('esm');

  return Promise.all([
    esmService.canFire(),
    address ? esmService.getTotalStakedByAddress(address) : null,
    maker.service('smartContract').getContract('END').when(),
    address ? maker.service('chief').getNumDeposits(address) : null
  ]);
}
