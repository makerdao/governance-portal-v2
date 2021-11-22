import { fetchJson } from 'lib/fetchJson';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
  mutate: () => void;
};

export function usePollTally(pollId: number, refreshInterval = 0): UsePollTallyResponse {
  const { data: tallyData, mutate } = useSWR<PollTally>(
    `/api/polling/tally/${pollId}?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval,
      revalidateOnMount: true
    }
  );

  return {
    tally: tallyData,
    mutate
  };
}
