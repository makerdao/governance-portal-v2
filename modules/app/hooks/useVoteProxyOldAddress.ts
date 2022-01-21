import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyOldAddress = (account: string): VoteProxyAddressResponse => {
  const { voteProxyFactoryOld } = <MainnetSdk>useContracts();

  const { data, error } = useSWR(`${account}/vote-proxy-address`, async () => {
    return await getVoteProxyAddresses(voteProxyFactoryOld, account);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
