import BigNumber from 'bignumber.js';
import getMaker from 'lib/maker';
import useSWR from 'swr';

type TokenAllowanceResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

// Checks if the user allowed the spending of a token and contract address
export const useTokenAllowance = (
  token: string,
  userAddress?: string,
  contractAddress?: string
): TokenAllowanceResponse => {
  const { data, error, mutate } = useSWR(
    userAddress && contractAddress ? ['token-balance', token, userAddress, contractAddress] : null,
    (_, token, userAddress, contractAddress) =>
      getMaker().then(maker => maker.getToken(token).allowance(userAddress, contractAddress))
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
