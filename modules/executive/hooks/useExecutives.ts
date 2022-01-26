import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { CMSProposal } from '../types';

type ExecutivesResponse = {
  data: CMSProposal[] | undefined;
  loading: boolean;
  error: Error;
};

export const useExecutives = (): ExecutivesResponse => {
  const { network } = useActiveWeb3React();

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
