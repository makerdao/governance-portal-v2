/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
  mutate: () => void;
  error: Error;
  isValidating: boolean;
};

export function usePollTally(pollId: number, refreshInterval = 0): UsePollTallyResponse {
  const network = useNetwork();
  const {
    data: tallyData,
    mutate,
    error,
    isValidating
  } = useSWR<PollTally>(
    typeof pollId !== 'undefined' ? `/api/polling/tally/${pollId}?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval,
      revalidateOnMount: true
    }
  );

  return {
    tally: tallyData,
    error,
    isValidating,
    mutate
  };
}
