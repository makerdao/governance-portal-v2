/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { gqlRequest } from '../gqlRequest';
import { useChainId } from 'wagmi';

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
  const chainId = useChainId();

  const { data, error } = useSWR(`gql-query/${chainId}/${cacheKey}`, async () => {
    return await gqlRequest({ chainId, query, variables });
  });

  return {
    data,
    loading: !data && !error,
    error
  };
};
