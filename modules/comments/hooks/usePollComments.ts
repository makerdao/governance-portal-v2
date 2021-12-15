import { fetchJson } from 'lib/fetchJson';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { PollCommentsAPIResponseItem } from '../types/comments';

type UsePollCommentsResponse = {
  comments: PollCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { data: commentsDatas, mutate } = useSWR<PollCommentsAPIResponseItem[]>(
    `/api/comments/polling/${pollId}?network=${getNetwork()}`,
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
