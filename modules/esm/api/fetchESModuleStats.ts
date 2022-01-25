import getMaker from 'lib/maker';
import { CurrencyObject } from 'modules/app/types/currency';

export type ESModuleStats = [CurrencyObject | null];

export async function fetchESModuleStats(address?: string): Promise<ESModuleStats> {
  const maker = await getMaker();

  return Promise.all([address ? maker.service('chief').getNumDeposits(address) : null]);
}
