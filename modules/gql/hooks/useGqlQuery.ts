import useSWR from 'swr';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { gqlRequest } from '../gqlRequest';

type GqlQueryResponse = {
  data: any;
  loading: boolean;
  error?: any;
};

export const useGqlQuery = ({
  query,
  variables,
  cacheKey
}: {
  query: any;
  variables?: Record<string, string>;
  cacheKey: string;
}): GqlQueryResponse => {
  const { chainId } = useActiveWeb3React();

  const { data, error } = useSWR(`gql-query/${chainId}/${cacheKey}`, async () => {
    return await gqlRequest({ chainId, query, variables });
  });

  return {
    data,
    loading: !data && !error,
    error
  };
};
