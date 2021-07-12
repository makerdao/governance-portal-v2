import useSWR from 'swr';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'types/currency';

type LockedMkrData = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useLockedMkr = (address: string, voteProxy?: any): LockedMkrData => {
  const { data, error } = useSWR(address ? ['/user/mkr-locked', address] : null, () =>
    getMaker().then(maker =>
      voteProxy ? voteProxy.getNumDeposits() : maker.service('chief').getNumDeposits(address)
    )
  );

  return {
    data: data,
    loading: !error && !data,
    error
  };
};
