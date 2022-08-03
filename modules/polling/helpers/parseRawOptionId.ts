import { toBuffer } from 'lib/utils';

export function parseRawOptionId(rawValue?: string): number[] {
  let voteBallot: number[] = [];
  if (rawValue) {
    const ballotBuffer = toBuffer(rawValue, { endian: 'little' });
    const ballot = [...ballotBuffer];
    voteBallot = ballot.reverse();
  }

  return voteBallot;
}
