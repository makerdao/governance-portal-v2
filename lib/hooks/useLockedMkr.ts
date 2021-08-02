import useSWR from 'swr';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'types/currency';
import { Delegate } from 'types/delegate';

type LockedMkrData = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useLockedMkr = (address?: string, voteProxy?: any, voteDelegate?: Delegate): LockedMkrData => {
  const addressToCache = voteProxy && !voteDelegate ? voteProxy.getProxyAddress() : address;
  const { data, error } = useSWR(address ? ['/user/mkr-locked', addressToCache] : null, () =>
    getMaker().then(maker =>
      voteProxy && !voteDelegate ? voteProxy.getNumDeposits() : maker.service('chief').getNumDeposits(address)
    )
  );

  return {
    data: data,
    loading: !error && !data,
    error
  };
};
