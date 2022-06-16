import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export const getVoteColor = (optionId: number, voteType: string, text = true): string => {
  if (voteType === POLL_VOTE_TYPE.RANKED_VOTE || voteType === POLL_VOTE_TYPE.UNKNOWN) {
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
