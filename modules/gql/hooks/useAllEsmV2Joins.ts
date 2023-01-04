/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { allEsmV2Joins } from 'modules/gql/queries/allEsmV2Joins';
import { AllEsmJoinsRecord } from 'modules/gql/generated/graphql';
import { useGqlQuery } from 'modules/gql/hooks/useGqlQuery';

type AllEsmJoinsResponse = {
  data: AllEsmJoinsRecord[];
  loading: boolean;
  error?: any;
};

export const useAllEsmV2Joins = (): AllEsmJoinsResponse => {
  const { data, error } = useGqlQuery({ cacheKey: 'allEsmV2Joins', query: allEsmV2Joins });

  return {
    data: data && data.allEsmV2Joins.nodes,
    loading: !data && !error,
    error
  };
};
