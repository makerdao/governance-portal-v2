import { useAccount } from 'modules/app/hooks/useAccount';

export const useDelegateVote = () => {
  const { voteDelegateContract } = useAccount();

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
