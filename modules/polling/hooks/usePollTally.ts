import { fetchJson } from 'lib/fetchJson';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
  mutate: () => void;
  error: Error;
  isValidating: boolean;
};

export function usePollTally(pollId: number, refreshInterval = 0): UsePollTallyResponse {
  const { network } = useActiveWeb3React();
  const {
    data: tallyData,
    mutate,
    error,
    isValidating
  } = useSWR<PollTally>(pollId ? `/api/polling/tally/${pollId}?network=${network}` : null, fetchJson, {
    revalidateOnFocus: false,
    refreshInterval,
    revalidateOnMount: true
  });

  return {
    tally: tallyData,
    error,
    isValidating,
    mutate
  };
}
