import { allEsmJoins } from 'modules/gql/queries/allEsmJoins';
import { AllEsmJoinsRecord } from 'modules/gql/generated/graphql';
import { useGqlQuery } from 'modules/gql/hooks/useGqlQuery';

type AllEsmJoinsResponse = {
  data: AllEsmJoinsRecord[];
  loading: boolean;
  error?: any;
};

export const useAllEsmJoins = (): AllEsmJoinsResponse => {
  const { data, error } = useGqlQuery({ cacheKey: 'allEsmJoins', query: allEsmJoins });

  return {
    data: data && data.allEsmJoins.nodes,
    loading: !data && !error,
    error
  };
};
