import getMaker from 'lib/maker';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import useSWR from 'swr';
import { useAccount } from 'modules/app/hooks/useAccount';

type VotedProposalsResponse = {
  data: any;
  loading: boolean;
  error: Error;
  mutate: any;
};

export const useVotedProposals = (passedAddress?: string): VotedProposalsResponse => {
  let addressToUse;

  // if address is passed, fetch for that
  if (passedAddress) {
    addressToUse = passedAddress;
  } else {
    // if no address, fetch for connected account
    const { account, voteDelegateContractAddress, voteProxyContractAddress } = useAccount();

    addressToUse = voteDelegateContractAddress
      ? voteDelegateContractAddress
      : voteProxyContractAddress
      ? voteProxyContractAddress
      : account;
  }

  const { data, error, mutate } = useSWR<string[]>(
    addressToUse ? ['/executive/voted-proposals', addressToUse] : null,
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(address)
          .then(slate => (slate !== ZERO_SLATE_HASH ? maker.service('chief').getSlateAddresses(slate) : []))
      ),
    { revalidateOnMount: true, refreshInterval: 60000, revalidateOnFocus: false }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
