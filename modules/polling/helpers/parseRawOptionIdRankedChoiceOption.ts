import { paddedArray, toBuffer } from 'lib/utils';

export function parseRawOptinIdRankedChoiceOption(rawValue?: string): number[] {
  let rankedChoiceOption: number[] = [];
  if (rawValue) {
    const ballotBuffer = toBuffer(rawValue, { endian: 'little' });
    const ballot = paddedArray(32 - ballotBuffer.length, ballotBuffer);
    rankedChoiceOption = ballot.reverse().filter(choice => choice !== 0);
  }

  return rankedChoiceOption;
}
