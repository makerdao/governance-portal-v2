import getMaker, { MKR } from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'modules/app/types/currency';

type MkrBalanceResponse = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMkrBalance = (address?: string): MkrBalanceResponse => {
  const { data, error, mutate } = useSWR(
    address ? ['/user/mkr-balance', address] : null,
    (_, address) => getMaker().then(maker => maker.getToken(MKR).balanceOf(address)),
    { revalidateOnMount: true }
  );

  console.log('MKR balance', data);

  return {
    data: data,
    loading: !error && !data,
    error,
    mutate
  };
};
