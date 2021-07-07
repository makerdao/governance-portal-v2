import useSWR from 'swr';
import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';

type LockedMkrData = {
  data?: BigNumber;
  loading: boolean;
  error: Error;
};

export const useLockedMkr = (
  address?: string,
  voteProxy?: any,
  voteDelegateAddress?: string
): LockedMkrData => {
  const lockedMkrKey = voteDelegateAddress || voteProxy?.getProxyAddress() || address;

  const { data, error } = useSWR(lockedMkrKey ? ['/user/mkr-locked', lockedMkrKey] : null, () =>
    getMaker().then(maker =>
      voteProxy
        ? voteProxy.getNumDeposits()
        : maker.service('chief').getNumDeposits(voteDelegateAddress ? voteDelegateAddress : address)
    )
  );

  return {
    data: data ? data.toBigNumber() : data,
    loading: !error && !data,
    error
  };
};
