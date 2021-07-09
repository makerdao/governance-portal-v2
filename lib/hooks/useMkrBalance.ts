import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

type MkrBalanceResponse = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useMkrBalance = (address): MkrBalanceResponse => {
  const { data, error } = useSWR(['/user/mkr-balance', address], (_, address) =>
    getMaker().then(maker => maker.getToken(MKR).balanceOf(address))
  );

  return {
    data: data,
    loading: !error && !data,
    error
  };
};
