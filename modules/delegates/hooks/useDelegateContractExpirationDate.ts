/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { useCurrentUserVoteDelegateContract } from './useCurrentUserVoteDelegateContract';

type VoteDelegateAddressResponse = {
  data: {
    expiration?: Date | null;
    voteDelegateContractAddress?: string;
  };
  loading: boolean;
  error: Error;
};

// Returns the vote delegate contract address for a account
export const useDelegateContractExpirationDate = (): VoteDelegateAddressResponse => {
  const { data: voteDelegateContract } = useCurrentUserVoteDelegateContract();

  const { data: expirationData, error } = useSWR(
    voteDelegateContract ? `${voteDelegateContract}/expiration-date` : null,
    async () => {
      const expiration = await voteDelegateContract?.expiration();

      return expiration ? new Date(expiration?.toNumber() * 1000) : null;
    }
  );
  return {
    data: {
      expiration: expirationData,
      voteDelegateContractAddress: voteDelegateContract?.address
    },
    loading: !error && !expirationData,
    error
  };
};
