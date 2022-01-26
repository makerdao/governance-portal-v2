import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import useSWR from 'swr';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getSlateAddresses } from '../helpers/getSlateAddresses';

type VotedProposalsResponse = {
  data: string[] | undefined;
  loading: boolean;
  error: Error;
  mutate: any;
};

export const useVotedProposals = (passedAddress?: string): VotedProposalsResponse => {
  let addressToUse;
  const { chief } = useContracts();

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
    addressToUse ? `${addressToUse}/executive/voted-proposals` : null,
    async () => {
      const votedSlate = await chief.votes(addressToUse);
      return votedSlate !== ZERO_SLATE_HASH ? await getSlateAddresses(chief, votedSlate) : [];
    },
    { revalidateOnMount: true, refreshInterval: 60000, revalidateOnFocus: false }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
