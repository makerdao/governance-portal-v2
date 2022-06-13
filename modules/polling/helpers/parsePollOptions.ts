import { fromBuffer } from 'lib/utils';

export const parsePollOptions = (pollOptions: string[]): string[] => {
  const optionIds = pollOptions.map(option => {
    if (!Array.isArray(option)) return option;
    if (option.length === 1) return option[0];
    const byteArray = new Uint8Array(32);
    option.forEach((optionIndex, i) => {
      byteArray[byteArray.length - i - 1] = optionIndex;
    });
    return fromBuffer(byteArray, {}).toString();
  });

  return optionIds;
};
