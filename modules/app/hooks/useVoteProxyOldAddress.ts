import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { MainnetSdk } from '@dethcrypto/eth-sdk-client';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { SupportedNetworks } from 'modules/web3/constants/networks';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error?: Error;
};

export const useVoteProxyOldAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactoryOld } = <MainnetSdk>useContracts();
  const { chainId } = useActiveWeb3React();

  // Only works in mainnet
  const network = chainIdToNetworkName(chainId as SupportedChainId);

  if (
    network === SupportedNetworks.GOERLI ||
    network === SupportedNetworks.GOERLIFORK ||
    network === SupportedNetworks.TESTNET
  ) {
    return {
      data: {
        hasProxy: false
      },
      loading: false
    };
  }

  const { data, error } = useSWR(account ? `${account}/vote-proxy-address` : null, async () => {
    return await getVoteProxyAddresses(voteProxyFactoryOld, account as string);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
