import getMaker from 'lib/maker';
import { ZERO_SLATE_HASH } from 'lib/executive/zeroSlateHash';
import useSWR from 'swr';
import useAccountsStore from 'stores/accounts';

type VotedProposalsResponse = {
  data: any;
  loading: boolean;
  error: Error;
};

export const useVotedProposals = (passedAddress?: string): VotedProposalsResponse => {
  let addressToUse;

  // if address is passed, fetch for that
  if (passedAddress) {
    addressToUse = passedAddress;
  } else {
    // if no address, fetch for connected account
    const account = useAccountsStore(state => state.currentAccount);
    const [voteProxy, voteDelegate] = useAccountsStore(state =>
      account ? [state.proxies[account.address], state.voteDelegate] : [null, null]
    );

    addressToUse = voteDelegate
      ? voteDelegate.getVoteDelegateAddress()
      : voteProxy
      ? voteProxy.getProxyAddress()
      : account?.address;
  }

  const { data, error } = useSWR<string[]>(
    addressToUse ? ['/executive/voted-proposals', addressToUse] : null,
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(address)
          .then(slate => (slate !== ZERO_SLATE_HASH ? maker.service('chief').getSlateAddresses(slate) : []))
      ),
    { refreshInterval: 60000 }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
