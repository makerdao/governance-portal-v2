import useSWR from 'swr';
import { useCurrentUserVoteDelegateContract } from './useCurrentUserVoteDelegateContract';

type VoteDelegateAddressResponse = {
  data?: Date | null;
  loading: boolean;
  error: Error;
};

// Returns the vote delegate contract address for a account
export const useDelegateContractExpirationDate = (): VoteDelegateAddressResponse => {
  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();

  const { data, error } = useSWR(
    voteDelegateContract ? `${voteDelegateContract}/expiration-date` : null,
    async () => {
      const expiration = await voteDelegateContract?.expiration();

      return expiration ? new Date(expiration?.toNumber() * 1000) : null;
    }
  );
  return {
    data,
    loading: !error && !data,
    error
  };
};
