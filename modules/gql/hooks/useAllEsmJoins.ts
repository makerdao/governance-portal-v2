import { allEsmJoins } from 'modules/gql/queries/allEsmJoins';
import { useQuery, CombinedError } from 'urql';
import { AllEsmJoinsRecord } from 'modules/gql/generated/graphql';

type AllEsmJoinsResponse = {
  data: AllEsmJoinsRecord[];
  loading: boolean;
  error?: CombinedError;
};

export const useAllEsmJoins = (): AllEsmJoinsResponse => {
  const [result] = useQuery({
    query: allEsmJoins
  });

  const { data, fetching, error } = result;

  return {
    data: data && data.allEsmJoins.nodes,
    loading: fetching,
    error
  };
};
