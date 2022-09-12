import { fetchJson } from 'lib/fetchJson';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR from 'swr';
import { PollTally } from '../types';

type UsePollTallyResponse = {
  tally: PollTally | undefined;
  mutate: () => void;
  error: Error;
  isValidating: boolean;
};

export function usePollTally(pollId: number, refreshInterval = 0): UsePollTallyResponse {
  const { network } = useWeb3();
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
