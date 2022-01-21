import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (account: string): VoteProxyAddressResponse => {
  const { voteProxyFactory } = useContracts();

  const { data, error } = useSWR(`${account}/vote-proxy-address`, async () => {
    return await getVoteProxyAddresses(voteProxyFactory, account);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
