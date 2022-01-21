import { fetchJson } from 'lib/fetchJson';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
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
  const { chainId } = useActiveWeb3React();
  const network = chainIdToNetworkName(chainId);

  const {
    data: commentsDatas,
    mutate,
    error
  } = useSWR<ExecutiveCommentsAPIResponseItem[]>(
    `/api/comments/executive/${proposalAddress}?network=${network}`,
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
