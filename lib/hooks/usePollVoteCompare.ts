import { useAllUserVotes } from 'lib/hooks';

type VoteCompare = { pollId: number; a1: number | undefined; a2: number | undefined };

type PollVoteCompareResponse = {
  data: VoteCompare[];
  loading: boolean;
  error?: Error;
};

export const usePollVoteCompare = (address1?: string, address2?: string): PollVoteCompareResponse => {
  const { data: a1votes, error: a1error } = useAllUserVotes(address1);
  const { data: a2votes, error: a2error } = useAllUserVotes(address2);

  const data = (a1votes || [])
    .map(pv1 => {
      const match = a2votes?.find(pv2 => (pv2.pollId = pv1.pollId));
      if (match) {
        const voteCompare: VoteCompare = { pollId: pv1.pollId, a1: pv1.option, a2: match.option };
        return voteCompare;
      } else {
        return null;
      }
    })
    .filter((voteCompare: VoteCompare | null) => !!voteCompare) as VoteCompare[];

  const error = a1error || a2error;

  return {
    data,
    loading: !error && !data,
    error
  };
};
