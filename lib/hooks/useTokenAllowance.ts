import BigNumber from 'bignumber.js';
import getMaker from 'lib/maker';
import useSWR from 'swr';

type TokenAllowanceResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: Error;
};

// Checks if the user allowed the spending of a token and contract address
const useTokenAllowance = (
  token: string,
  userAddress: string,
  contractAddress: string
): TokenAllowanceResponse => {
  const { data, error } = useSWR(
    ['token-balance', token, userAddress, contractAddress],
    (_, token, userAddress, contractAddress) =>
      getMaker().then(maker => maker.getToken(token).allowance(userAddress, contractAddress))
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};

export default useTokenAllowance;
