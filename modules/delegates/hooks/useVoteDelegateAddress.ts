/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

type VoteDelegateAddressResponse = {
  data?: string | undefined;
  loading: boolean;
  error: Error;
  mutate: () => void;
};

// Returns the vote delegate contract address for a account
export const useVoteDelegateAddress = (account?: string): VoteDelegateAddressResponse => {
  const { voteDelegateFactory, voteDelegateFactoryOld } = useContracts();

  const { data, error, mutate } = useSWR(account ? `${account}/vote-delegate-address` : null, async () => {
    const [newVdAddress, oldVdAddress] = await Promise.all([
      voteDelegateFactory.delegates(account as string),
      voteDelegateFactoryOld.delegates(account as string)
    ]);

    if (newVdAddress !== ZERO_ADDRESS) return newVdAddress;
    if (oldVdAddress !== ZERO_ADDRESS) return oldVdAddress;
    return undefined;
  });
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
