import getMaker from 'lib/maker';
import useSWR from 'swr';
import useAccountsStore from 'stores/accounts';

type VotedProposalsResponse = {
  data: any;
  loading: boolean;
  error: Error;
};

export const useVotedProposals = (): VotedProposalsResponse => {
  const account = useAccountsStore(state => state.currentAccount);
  const [voteProxy, voteDelegate] = useAccountsStore(state =>
    account ? [state.proxies[account.address], state.voteDelegate] : [null, null]
  );

  const { data, error } = useSWR<string[]>(
    account?.address ? ['/executive/voted-proposals', account?.address] : null,
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(
            voteDelegate
              ? voteDelegate.getVoteDelegateAddress()
              : voteProxy
              ? voteProxy.getProxyAddress()
              : address
          )
          .then(slate => maker.service('chief').getSlateAddresses(slate))
      )
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
