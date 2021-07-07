import useSWR from 'swr';
import getMaker from 'lib/maker';

type Inputs = {
  lockedMkrKey: string;
  voteProxy: any;
  voteDelegate: any;
};

type LockedMkrData = {
  data: any;
  loading: boolean;
  error: Error;
};

export const useLockedMkr = ({ lockedMkrKey, voteProxy, voteDelegate }: Inputs): LockedMkrData => {
  const { data, error } = useSWR(lockedMkrKey ? ['/user/mkr-locked', lockedMkrKey] : null, (_, address) =>
    getMaker().then(maker =>
      voteProxy
        ? voteProxy.getNumDeposits()
        : maker
            .service('chief')
            .getNumDeposits(voteDelegate ? voteDelegate.getVoteDelegateAddress() : address)
    )
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
