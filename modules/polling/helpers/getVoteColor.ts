import { PollInputFormat } from 'modules/polling/polling.constants';

export const getVoteColor = (optionId: number, inputFormat: PollInputFormat, text = true): string => {
  if (inputFormat === PollInputFormat.rankFree) {
    if (optionId === 0) {
      return '#708390';
    }
    if (text) return 'text';
    return '#708390';
  }

  const colors = {
    0: '#708390',
    1: '#1AAB9B',
    2: '#F77249'
  };

  return colors[optionId];
};
