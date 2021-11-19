import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { CMSProposal } from '../types';

type ExecutivesResponse = {
  data: CMSProposal[] | undefined;
  loading: boolean;
  error: Error;
};

export const useExecutives = (): ExecutivesResponse => {
  const { data, error } = useSWR<CMSProposal[]>(`/api/executive?network=${getNetwork()}`, {
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
