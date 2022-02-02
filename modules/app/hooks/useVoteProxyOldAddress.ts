import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

import { SupportedNetworks } from 'modules/web3/constants/networks';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error?: Error;
};

export const useVoteProxyOldAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactoryOld } = useContracts() as MainnetSdk;
  const { network } = useActiveWeb3React();

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
