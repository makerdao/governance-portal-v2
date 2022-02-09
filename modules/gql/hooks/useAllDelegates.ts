import { allDelegates } from 'modules/gql/queries/allDelegates';
import { AllDelegatesRecord } from 'modules/gql/generated/graphql';
import { useGqlQuery } from 'modules/gql/hooks/useGqlQuery';

type AllDelegatesResponse = {
  data: AllDelegatesRecord[];
  loading: boolean;
  error?: any;
};

export const useAllDelegates = (): AllDelegatesResponse => {
  const { data, error } = useGqlQuery({ cacheKey: 'allDelegates', query: allDelegates });

  return {
    data: data && data.allDelegates.nodes,
    loading: !data && !error,
    error
  };
};
