import { useVoteDelegate } from 'modules/app/hooks/useVoteDelegate';

export const useDelegateVote = () => {
  const { data: voteDelegateContract } = useVoteDelegate();

  let voteOne, voteMany;

  if (voteDelegateContract) {
    voteOne = voteDelegateContract['vote(bytes32)'];
    voteMany = voteDelegateContract['vote(address[])'];
  }

  return {
    voteOne,
    voteMany
  };
};
