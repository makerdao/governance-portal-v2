/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR, { useSWRConfig } from 'swr';
import { getSKYVotingWeight, SKYVotingWeightResponse } from '../helpers/getSKYVotingWeight';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type VotingWeightResponse = {
  data?: SKYVotingWeightResponse;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useSkyVotingWeight = ({
  address,
  excludeDelegateOwnerBalance = false
}: {
  address?: string;
  // this needs to be "true" when displaying the SKY balance of a delegate contract
  // they can have voting power through their delegate contract, but the balance is not theirs
  excludeDelegateOwnerBalance?: boolean;
}): VotingWeightResponse => {
  const network = useNetwork();
  const { cache } = useSWRConfig();

  const dataKey = `/user/polling-voting-weight/${address}/${network}`;

  // Only revalidate every 60 seconds, do not revalidate on mount if it's already fetched
  const { data, error, mutate } = useSWR(
    address ? dataKey : null,
    () => getSKYVotingWeight(address as string, network, excludeDelegateOwnerBalance),
    {
      revalidateOnFocus: false,
      revalidateOnMount: !cache.get(dataKey),
      refreshInterval: 60000
    }
  );

  return {
    data,
    loading: !error && data === undefined,
    error,
    mutate
  };
};
