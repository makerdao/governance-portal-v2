import { fetchJson } from 'lib/fetchJson';
import { formatUnits } from 'ethers/lib/utils';
import { GASNOW_ENDPOINT } from '../constants/networks';

export const fetchGasPrice = async (
  speed: 'standard' | 'fast' | 'rapid' | 'slow' = 'fast'
): Promise<string | number> => {
  try {
    const jsonResponse = await fetchJson(GASNOW_ENDPOINT);

    return parseInt(formatUnits(jsonResponse.data[speed], 'gwei'));
  } catch (e) {
    console.error('Error fetching gas price', e.message);
    return '--';
  }
};
