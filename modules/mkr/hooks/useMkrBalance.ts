import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'types/currency';

type MkrBalanceResponse = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useMkrBalance = (address?: string): MkrBalanceResponse => {
  const { data, error } = useSWR(
    address ? ['/user/mkr-balance', address] : null,
    (_, address) => getMaker().then(maker => maker.getToken(MKR).balanceOf(address)),
    { revalidateOnMount: true }
  );

  return {
    data: data,
    loading: !error && !data,
    error
  };
};
