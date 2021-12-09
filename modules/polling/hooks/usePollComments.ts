import { fetchJson } from 'lib/fetchJson';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { PollComment } from '../types/pollComments';

type UsePollCommentsResponse = {
  comments: PollComment[] | undefined;
  mutate: () => void;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { data: commentsDatas, mutate } = useSWR<PollComment[]>(
    `/api/polling/comments/${pollId}?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval,
      revalidateOnMount: true
    }
  );

  return {
    comments: commentsDatas,
    mutate
  };
}
