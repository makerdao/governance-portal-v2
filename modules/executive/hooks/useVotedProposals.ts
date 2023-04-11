/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import useSWR from 'swr';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';

type VotedProposalsResponse = {
  data: string[];
  loading: boolean;
  error: Error;
  mutate: any;
};

export const useVotedProposals = (passedAddress?: string): VotedProposalsResponse => {
  const { chief } = useContracts();
  const { votingAccount } = useAccount();
  const addressToUse = passedAddress ? passedAddress : votingAccount;

  const { data, error, mutate } = useSWR<string[]>(
    addressToUse ? `${addressToUse}/executive/voted-proposals` : null,
    async () => {
      const votedSlate = await chief.votes(addressToUse as string);
      return votedSlate !== ZERO_SLATE_HASH ? await getSlateAddresses(chief, votedSlate) : [];
    },
    { revalidateOnMount: true, refreshInterval: 60000, revalidateOnFocus: false }
  );

  return {
    data: data || [],
    loading: !error && !data,
    error,
    mutate
  };
};
