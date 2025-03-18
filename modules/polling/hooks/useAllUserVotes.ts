/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR from 'swr';
import { PollTallyVote } from 'modules/polling/types';
import { fetchAllCurrentVotes } from '../api/fetchAllCurrentVotes';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type AllUserVotesResponse = {
  data?: PollTallyVote[];
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useAllUserVotes = (address?: string): AllUserVotesResponse => {
  const network = useNetwork();
  const { data, error, mutate } = useSWR<PollTallyVote[]>(
    address ? `/user/voting-for/${address}` : null,
    () => {
      return fetchAllCurrentVotes(address as string, network);
    },
    { refreshInterval: 0 }
  );
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
