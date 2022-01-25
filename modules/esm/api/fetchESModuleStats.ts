import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';
import { CurrencyObject } from 'modules/app/types/currency';

export type ESModuleStats = [BigNumber | null, CurrencyObject | null];

export async function fetchESModuleStats(address?: string): Promise<ESModuleStats> {
  const maker = await getMaker();

  return Promise.all([
    maker.service('smartContract').getContract('END').when(),
    address ? maker.service('chief').getNumDeposits(address) : null
  ]);
}
