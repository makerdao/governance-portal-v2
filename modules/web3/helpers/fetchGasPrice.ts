/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { formatUnits } from 'ethers/lib/utils';
import { GASNOW_ENDPOINT } from '../constants/networks';
import logger from 'lib/logger';

export const fetchGasPrice = async (
  speed: 'standard' | 'fast' | 'rapid' | 'slow' = 'fast'
): Promise<string | number> => {
  try {
    const jsonResponse = await fetchJson(GASNOW_ENDPOINT);

    return parseInt(formatUnits(jsonResponse.data[speed], 'gwei'));
  } catch (e) {
    logger.error('fetchGasPrice: Error fetching gas price', e.message);
    return '--';
  }
};
