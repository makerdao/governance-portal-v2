import BigNumber from 'bignumber.js';
import { fetchJson } from 'lib/fetchJson';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { ExecutiveCommentsAPIResponseItem, ParsedExecutiveComments } from '../types/comments';

type UseExecutiveCommentsResponse = {
  comments: ParsedExecutiveComments[] | undefined;
  mutate: () => void;
  error: boolean;
};

export function useExecutiveComments(
  proposalAddress: string,
  refreshInterval = 0
): UseExecutiveCommentsResponse {
  const { network } = useActiveWeb3React();

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

  //convert voterWeight from strings to BigNumbers
  const commentsParsed = commentsDatas?.map(c => {
    const { comment, ...rest } = c;
    const { voterWeight } = comment;
    return {
      comment: {
        ...comment,
        voterWeight: new BigNumber(voterWeight.replace(/,/g, '')) //remove commas from string before converting to BigNumber
      },
      ...rest
    };
  });

  return {
    comments: commentsParsed,
    mutate,
    error
  };
}
