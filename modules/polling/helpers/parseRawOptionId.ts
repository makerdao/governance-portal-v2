import { toBuffer } from 'lib/utils';

export function parseRawOptionId(rawValue?: string): number[] {
  let voteBallot: number[] = [];
  if (rawValue) {
    const ballotBuffer = toBuffer(rawValue, { endian: 'little' });
    const ballot = [...ballotBuffer];
    voteBallot = ballot.reverse()
    
    // TODO: Check what happens when removing abstain options .filter(choice => choice !== 0);
  }

  return voteBallot;
}
 