import { getChainDelegates } from 'lib/api';
import useSWR from 'swr';
import { DelegateContractInformation } from 'types/delegate';

type AllDelegatesResponse = {
  data?: DelegateContractInformation[];
  loading: boolean;
  error?: Error;
};

// fetches all delegates created by factory contract
export const useAllDelegates = (): AllDelegatesResponse => {
  const { data, error } = useSWR('/all-delegates', () => getChainDelegates());

  return {
    data,
    loading: !error && !data,
    error
  };
};
