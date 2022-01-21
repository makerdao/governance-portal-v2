import { fetchJson } from 'lib/fetchJson';
import useSWR from 'swr';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';

type UsePollCommentsResponse = {
  comments: PollCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { chainId } = useActiveWeb3React();
  const network = chainIdToNetworkName(chainId);

  const { data: commentsDatas, mutate } = useSWR<PollCommentsAPIResponseItem[]>(
    `/api/comments/polling/${pollId}?network=${network}`,
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
