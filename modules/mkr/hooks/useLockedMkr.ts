import useSWR from 'swr';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'modules/app/types/currency';
import { VoteDelegateContract } from 'modules/delegates/types/voteDelegateContract';
import { VoteProxyContract } from 'modules/app/types/voteProxyContract';

type LockedMkrData = {
  data: CurrencyObject;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

export const useLockedMkr = (
  address?: string,
  voteProxy?: VoteProxyContract | null,
  voteDelegate?: VoteDelegateContract | null
): LockedMkrData => {
  const addressToCache = voteProxy && !voteDelegate ? voteProxy.getProxyAddress() : address;
  const { data, error, mutate } = useSWR(
    address ? ['/user/mkr-locked', addressToCache] : null,
    () =>
      getMaker().then(maker =>
        voteProxy && !voteDelegate
          ? voteProxy.getNumDeposits()
          : maker.service('chief').getNumDeposits(address)
      ),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
