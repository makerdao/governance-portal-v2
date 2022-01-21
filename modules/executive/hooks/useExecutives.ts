import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { CMSProposal } from '../types';

type ExecutivesResponse = {
  data: CMSProposal[] | undefined;
  loading: boolean;
  error: Error;
};

export const useExecutives = (): ExecutivesResponse => {
  const { chainId } = useActiveWeb3React();
  const network = chainIdToNetworkName(chainId);

  const { data, error } = useSWR<CMSProposal[]>(`/api/executive?network=${network}`, {
    refreshInterval: 60000,
    revalidateOnMount: true,
    revalidateOnFocus: false
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
