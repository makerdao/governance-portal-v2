import useSWR from 'swr';
import getMaker from 'lib/maker';

type Inputs = {
  lockedMkrKey: string;
  voteProxy: any;
  voteDelegateAddress: string;
};

type LockedMkrData = {
  data: any;
  loading: boolean;
  error: Error;
};

const useLockedMkr = ({ lockedMkrKey, voteProxy, voteDelegateAddress }: Inputs): LockedMkrData => {
  const { data, error } = useSWR(lockedMkrKey ? ['/user/mkr-locked', lockedMkrKey] : null, (_, address) =>
    getMaker().then(maker =>
      voteProxy
        ? voteProxy.getNumDeposits()
        : maker.service('chief').getNumDeposits(voteDelegateAddress ? voteDelegateAddress : address)
    )
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};

export default useLockedMkr;
