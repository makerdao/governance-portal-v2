export const getVoteColor = (optionId: number, voteType: string): string => {
  if (voteType === 'Ranked Choice IRV') {
    return '#708390';
  }

  const colors = {
    0: '#708390',
    1: '#1AAB9B',
    2: '#F77249'
  };

  return colors[optionId];
};
