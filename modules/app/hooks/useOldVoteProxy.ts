import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

type UseOldProxyResponse = {
  data?: {
    role: string;
    address: string;
  };
  loading: boolean;
  error?: Error;
};

export const useOldVoteProxy = (account: string): UseOldProxyResponse => {
  const { chainId } = useActiveWeb3React();
  const network = chainIdToNetworkName(chainId as SupportedChainId);

  if (
    network === SupportedNetworks.GOERLI ||
    network === SupportedNetworks.GOERLIFORK ||
    network === SupportedNetworks.TESTNET
  ) {
    return {
      data: { role: '', address: '' },
      loading: false
    };
  }

  const { oldVoteProxy } = useContracts();

  const { data, error } = useSWR(`${account}/old-vote-proxy`, async () => {
    return await Promise.all([oldVoteProxy.coldMap(account), oldVoteProxy.hotMap(account)]).then(
      ([proxyAddressCold, proxyAddressHot]) => {
        if (proxyAddressCold !== ZERO_ADDRESS) return { role: 'cold', address: proxyAddressCold };
        if (proxyAddressHot !== ZERO_ADDRESS) return { role: 'hot', address: proxyAddressHot };
      }
    );
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
