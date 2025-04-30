/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { formatUnits } from 'viem';

export function limitString(str: string, length: number, overflow: string): string {
  return (str || '').length <= length ? str : `${(str || '').substr(0, length - 1)}${overflow}`;
}

export function cutMiddle(text = '', left = 6, right = 4): string {
  if (text.length <= left + right) return text;
  return `${text.substring(0, left)}...${text.substring(text.length - right, text.length)}`;
}

export function formatValue(
  value: bigint,
  type: string | number = 'wad',
  dp = 2,
  withCommas = true,
  roundDown = false,
  truncateLarge = false
): string {
  if (typeof type === 'string') {
    switch (type) {
      case 'ray':
        return formatValue(value, 27, dp, withCommas, roundDown, truncateLarge);
      case 'rad':
        return formatValue(value, 45, dp, withCommas, roundDown, truncateLarge);
      case 'wei':
        return formatValue(value, 0, dp, withCommas, roundDown, truncateLarge);
      case 'kwei':
        return formatValue(value, 3, dp, withCommas, roundDown, truncateLarge);
      case 'mwei':
        return formatValue(value, 6, dp, withCommas, roundDown, truncateLarge);
      case 'gwei':
        return formatValue(value, 9, dp, withCommas, roundDown, truncateLarge);
      case 'szabo':
        return formatValue(value, 12, dp, withCommas, roundDown, truncateLarge);
      case 'finney':
        return formatValue(value, 15, dp, withCommas, roundDown, truncateLarge);
      case 'ether':
      case 'wad':
      default:
        return formatValue(value, 18, dp, withCommas, roundDown, truncateLarge);
    }
  }

  if (value === 0n) {
    return '0';
  }
  const formatted = formatUnits(value, type);
  if (+formatted > 999) dp = 0;
  const fixed = dp || dp === 0 ? (+formatted).toFixed(dp) : formatted;
  if (+fixed < 0.01 && roundDown) return '≈0.00';
  
  if (truncateLarge && +fixed >= 1e9) {
    return (+fixed / 1e9).toFixed(2) + 'B';
  }
  
  const finished = withCommas ? (+fixed).toLocaleString(undefined, { maximumFractionDigits: dp }) : fixed;
  return finished;
}
