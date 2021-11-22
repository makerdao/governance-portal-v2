import { fetchJson } from 'lib/fetchJson';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
};

export function usePollTally(pollId: number): UsePollTallyResponse {
  const { data: tallyData } = useSWR<PollTally>(
    `/api/polling/tally/${pollId}?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return {
    tally: tallyData
  };
}
