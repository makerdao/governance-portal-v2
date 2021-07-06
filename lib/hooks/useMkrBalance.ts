import BigNumber from 'bignumber.js';
import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';

type MkrBalanceResponse = {
  data?: BigNumber;
  loading: boolean;
  error?: any;
};

export const useMkrBalance = (address): MkrBalanceResponse => {
  const { data, error } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  return {
    data: data ? data.toBigNumber() : data,
    loading: !error && !data,
    error
  };
};
