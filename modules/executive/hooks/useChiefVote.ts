import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';

export const useChiefVote = () => {
  const { chief } = useContracts();

  return { voteOne: chief['vote(bytes32)'], voteMany: chief['vote(address[])'] };
};
