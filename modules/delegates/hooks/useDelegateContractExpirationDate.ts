import { add } from 'date-fns';
import { hardcodedExpired } from 'modules/migration/delegateAddressLinks';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
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
  const { account } = useActiveWeb3React();

  const { data, error } = useSWR(
    voteDelegateContract ? `${voteDelegateContract}/expiration-date` : null,
    async () => {
      const expiration = await voteDelegateContract?.expiration();
      // TODO: Remove hardcoded contracts
      const isHardcoded = hardcodedExpired.find(c => c.toLowerCase() === (account || '').toLowerCase());

      if (isHardcoded) {
        return add(new Date(), { weeks: 1 });
      }
      return expiration ? new Date(expiration?.toNumber() * 1000) : null;
    }
  );
  return {
    data,
    loading: !error && !data,
    error
  };
};
