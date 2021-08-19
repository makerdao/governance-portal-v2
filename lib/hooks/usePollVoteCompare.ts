import { useAllUserVotes } from 'lib/hooks';

type PollVoteCompareResponse = {
  data?: { pollId: string; a1: string; a2: string }[];
  loading: boolean;
  error?: Error;
};

export const usePollVoteCompare = (address1?: string, address2?: string): PollVoteCompareResponse => {
  const { data: a1votes, error: a1error } = useAllUserVotes(address1);
  const { data: a2votes, error: a2error } = useAllUserVotes(address2);

  const data = a1votes
    ?.map(pv1 => {
      const match = a2votes?.find(pv2 => (pv2.pollId = pv1.pollId));
      if (match) {
        return { pollId: pv1.pollId, a1: pv1.option, a2: match.option };
      } else {
        return null;
      }
    })
    .filter(poll => !!poll);

  const error = a1error || a2error;

  return {
    data,
    loading: !error && !data,
    error
  };
};
