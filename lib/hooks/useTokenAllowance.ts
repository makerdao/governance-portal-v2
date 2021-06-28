import getMaker from 'lib/maker';
import useSWR from 'swr';

const useTokenBalance = (token, userAddress, contractAddress) => {
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

export default useTokenBalance;
