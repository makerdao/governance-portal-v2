import { parseUnits } from 'ethers/lib/utils';
import { fetchJson } from 'lib/fetchJson';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
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
  const { network } = useWeb3();

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
        voterWeight: parseUnits(voterWeight.replace(/,/g, '')) //remove commas from string before converting to BigNumber
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
