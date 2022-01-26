import { fetchJson } from 'lib/fetchJson';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
  mutate: () => void;
};

export function usePollTally(pollId: number, refreshInterval = 0): UsePollTallyResponse {
  const { network } = useActiveWeb3React();
  const { data: tallyData, mutate } = useSWR<PollTally>(
    `/api/polling/tally/${pollId}?network=${network}`,
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
