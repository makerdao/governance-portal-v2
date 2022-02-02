import { BigNumber } from 'ethers';
import { commify, formatUnits } from 'ethers/lib/utils';

export function limitString(str: string, length: number, overflow: string): string {
  return str.length <= length ? str : `${str.substr(0, length - 1)}${overflow}`;
}

export function cutMiddle(text = '', left = 6, right = 4): string {
  if (text.length <= left + right) return text;
  return `${text.substring(0, left)}...${text.substring(text.length - right, text.length)}`;
}

const builtInUnits = ['wei', 'kwei', 'mwei', 'gwei', 'szabo', 'finney', 'ether'];

export function formatValue(
  value: BigNumber,
  type: string | number = 'wad',
  dp = 6,
  withCommas = true
): string {
  if (typeof type === 'string') {
    if (!builtInUnits.includes(type)) {
      switch (type) {
        case 'wad':
          return formatValue(value, 18, dp, withCommas);
        case 'ray':
          return formatValue(value, 27, dp, withCommas);
        case 'rad':
          return formatValue(value, 45, dp, withCommas);
      }
    }
  }
  const formatted = formatUnits(value, type);
  const fixed = dp || dp === 0 ? (+formatted).toFixed(dp) : formatted;
  const finished = withCommas ? commify(fixed) : fixed;
  return finished;
}
