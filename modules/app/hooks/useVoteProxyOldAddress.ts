import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';

import { SupportedNetworks } from 'modules/web3/constants/networks';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error?: Error;
};

export const useVoteProxyOldAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactoryOld } = useContracts() as MainnetSdk;
  const { network } = useWeb3();

  const { data, error } = useSWR(
    account && network !== SupportedNetworks.MAINNET ? `${account}/vote-proxy-address` : null,
    async () => {
      return await getVoteProxyAddresses(voteProxyFactoryOld, account as string, network);
    }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
