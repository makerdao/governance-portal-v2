/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

type HasV1VoteDelegateResponse = {
  data?: boolean | undefined;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

// Returns whether the address has a v1 vote delegate contract
export const useHasV1VoteDelegate = (account?: string): HasV1VoteDelegateResponse => {
  const { voteDelegateFactoryOld } = useContracts();
  const { data, error, mutate } = useSWR(account ? `${account}/has-v1-vote-delegate-address` : null, async () => {
    if (!account) return false;
    const newVdAddress = await voteDelegateFactoryOld.delegates(account);

    return newVdAddress !== ZERO_ADDRESS;
  });
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
