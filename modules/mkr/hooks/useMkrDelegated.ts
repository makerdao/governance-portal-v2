import getMaker from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

type TokenAllowanceResponse = {
  data: CurrencyObject;
  loading: boolean;
  error: Error;
  mutate: any;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegated = (
  userAddress?: string,
  voteDelegateAddress?: string
): TokenAllowanceResponse => {
  const { data, error, mutate } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async (_, delegateAddress, address) => {
      const maker = await getMaker();

      const balance = await maker
        .service('voteDelegate')
        .getStakedBalanceForAddress(delegateAddress, address);

      return balance;
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
