import { Poll } from 'modules/polling/types';

export function extractWinnerDefault(poll: Poll, defaultValue: number): number | null {
  const options = Object.keys(poll.options).map(key => parseInt(key, 10));

  if (options.indexOf(defaultValue) !== -1) {
    return defaultValue;
  }
  return null;
}
