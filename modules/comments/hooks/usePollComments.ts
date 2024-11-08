/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import useSWR from 'swr';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';

type UsePollCommentsResponse = {
  comments: PollCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
  error?: Error;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { network } = useWeb3();

  const {
    data: commentsDatas,
    error,
    mutate
  } = useSWR<PollCommentsAPIResponseItem[]>(`/api/comments/polling/${pollId}?network=${network}`, fetchJson, {
    revalidateOnFocus: false,
    refreshInterval,
    revalidateOnMount: true
  });

  return {
    comments: commentsDatas,
    mutate,
    error
  };
}
