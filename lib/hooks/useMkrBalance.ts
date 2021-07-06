import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';

export const useMkrBalance = address => {
  const { data, error } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
