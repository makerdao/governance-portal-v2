import { fetchJson } from 'lib/fetchJson';
import useSWR from 'swr';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type UsePollCommentsResponse = {
  comments: PollCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
  error?: Error;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { network } = useActiveWeb3React();

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
