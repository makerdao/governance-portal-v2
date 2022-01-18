import { useVoteDelegate } from 'modules/app/hooks/useVoteDelegate';

export const useDelegateVote = () => {
  const { data: voteDelegate } = useVoteDelegate();

  let voteOne, voteMany;

  if (voteDelegate) {
    voteOne = voteDelegate['vote(bytes32)'];
    voteMany = voteDelegate['vote(address[])'];
  }

  return {
    voteOne,
    voteMany
  };
};
