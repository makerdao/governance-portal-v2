import useSWR from 'swr';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'types/currency';

type Inputs = {
  lockedMkrKey?: string;
  voteProxy?: any;
};

type LockedMkrData = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useLockedMkr = ({ lockedMkrKey, voteProxy }: Inputs): LockedMkrData => {
  const { data, error } = useSWR(lockedMkrKey ? ['/user/mkr-locked', lockedMkrKey] : null, (_, address) =>
    getMaker().then(maker =>
      voteProxy ? voteProxy.getNumDeposits() : maker.service('chief').getNumDeposits(address)
    )
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
