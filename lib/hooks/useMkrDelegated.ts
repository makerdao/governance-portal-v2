import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

type TokenAllowanceResponse = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegated = (
  userAddress?: string,
  voteDelegateAddress?: string
): TokenAllowanceResponse => {
  const { data, error } = useSWR(
    userAddress && voteDelegateAddress ? ['/user/mkr-delegated', voteDelegateAddress, userAddress] : null,
    async (_, delegateAddress, address) => {
      const maker = await getMaker();

      const balance = await maker
        .service('voteDelegate')
        .getStakedBalanceForAddress(delegateAddress, address)
        .then(MKR.wei);

      return balance;
    }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
