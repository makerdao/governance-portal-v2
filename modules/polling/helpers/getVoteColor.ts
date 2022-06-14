import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export const getVoteColor = (optionId: number, voteType: string): string => {
  if (voteType === POLL_VOTE_TYPE.RANKED_VOTE || voteType === POLL_VOTE_TYPE.UNKNOWN) {
    return '#231536';
  }

  const colors = {
    0: '#708390',
    1: '#1AAB9B',
    2: '#F77249'
  };

  return colors[optionId];
};
