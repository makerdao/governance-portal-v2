import useSWR from 'swr';
import { getExecutiveProposals } from 'lib/api';

type ExecProposalsResponse = {
  data?: any[];
  loading: boolean;
  error?: Error;
};

const getExecApiResponse = async () => {
  return await getExecutiveProposals();
};

export const useExecProposals = (): ExecProposalsResponse => {
  const { data, error } = useSWR('/executive/proposals', getExecApiResponse, { refreshInterval: 600000 });

  return {
    data,
    loading: !error && !data,
    error
  };
};
