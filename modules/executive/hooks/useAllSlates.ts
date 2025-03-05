/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { DEPLOYMENT_BLOCK } from 'modules/contracts/contracts.constants';
import { useChainId, usePublicClient } from 'wagmi';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

type AllSlatesResponse = {
  data?: string[];
  loading: boolean;
  error?: Error;
};

export const useAllSlates = (): AllSlatesResponse => {
  const chainId = useChainId();
  const client = usePublicClient({ chainId });

  const { data, error } = useSWR(`/${chiefAddress[chainId]}/executive/all-slates`, async () => {
    const logs = await client?.getLogs({
      fromBlock: DEPLOYMENT_BLOCK[chiefAddress[chainId]],
      toBlock: 'latest',
      address: chiefAddress[chainId],
      event: chiefAbi[1]
    });
    const topics = logs?.map(e => e.topics[1]);
    return topics;
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
