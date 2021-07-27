import useSWR from 'swr';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'types/currency';
import { VoteDelegateContract } from 'types/voteDelegateContract';
import { VoteProxyContract } from 'types/voteProxyContract';

type LockedMkrData = {
  data?: CurrencyObject;
  loading?: boolean;
  error?: Error;
};

export const useLockedMkr = (address?: string, voteProxy?: VoteProxyContract | null, voteDelegate?: VoteDelegateContract | null): LockedMkrData => {
  const { data, error } = useSWR(address ? ['/user/mkr-locked', address] : null, () =>
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
