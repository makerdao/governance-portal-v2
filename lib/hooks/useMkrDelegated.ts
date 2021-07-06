import BigNumber from 'bignumber.js';
import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';

type TokenAllowanceResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
};

// Fetches the amount delegated from one user to one contract address
export const useMkrDelegated = (
  userAddress?: string,
  voteDelegateAddress?: string
): TokenAllowanceResponse => {
  const { data, error } = useSWR(
    ['/user/mkr-delegated', voteDelegateAddress, userAddress],
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
    data: data ? data.toBigNumber() : data,
    loading: !error && !data,
    error
  };
};
