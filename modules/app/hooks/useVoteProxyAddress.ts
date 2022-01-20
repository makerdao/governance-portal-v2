import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { getVoteProxyAddresses } from '../api/getVoteProxyAddresses';
import { VoteProxyAddresses } from '../types/voteProxyAddresses';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (addressToCheck?: string): VoteProxyAddressResponse => {
  let account;

  const { voteProxyFactory } = useContracts();

  if (addressToCheck) {
    account = addressToCheck;
  } else {
    const activeWeb3 = useActiveWeb3React();
    account = activeWeb3.account;
  }

  const { data, error } = useSWR(`${account}/vote-proxy-address`, async () => {
    return await getVoteProxyAddresses(voteProxyFactory, account);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
