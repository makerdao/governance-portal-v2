import { request } from 'graphql-request';
import useSWR from 'swr';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { CHAIN_INFO, SupportedChainId } from 'modules/web3/web3.constants';

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
  const id = chainId ?? SupportedChainId.MAINNET;
  const url = CHAIN_INFO[id].spockUrl;

  const { data, error } = useSWR(`gql-query/${chainId}/${cacheKey}`, async () => {
    return await request(url, query, variables);
  });

  return {
    data,
    loading: !data && !error,
    error
  };
};
