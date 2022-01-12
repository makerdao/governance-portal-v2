import { fetchJson } from 'lib/fetchJson';
import { getNetwork } from 'lib/maker';
import useSWR from 'swr';
import { ExecutiveCommentsAPIResponseItem } from '../types/comments';

type UseExecutiveCommentsResponse = {
  comments: ExecutiveCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
  error: boolean;
};

export function useExecutiveComments(
  proposalAddress: string,
  refreshInterval = 0
): UseExecutiveCommentsResponse {
  const { data: commentsDatas, mutate, error } = useSWR<ExecutiveCommentsAPIResponseItem[]>(
    `/api/comments/executive/${proposalAddress}?network=${getNetwork()}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval,
      revalidateOnMount: true
    }
  );

  return {
    comments: commentsDatas,
    mutate,
    error
  };
}
