import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';
import BigNumber from 'bignumber.js';
import withApiHandler from 'lib/api/withApiHandler';
import getMaker, { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import { backoffRetry } from 'lib/utils';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { PollTallyVote, PollVoteType, RawPollTally } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse<RawPollTally>) => {
    const pollId = req.query['poll-id'] as string;
    const network = (req.query.network as string) || DEFAULT_NETWORK;

    // if poll vote type is unknown, treat as ranked choice
    const voteType: PollVoteType = (req.query.type as PollVoteType) || POLL_VOTE_TYPE.RANKED_VOTE;

    invariant(pollId, 'poll id required');
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const tally: RawPollTally = await backoffRetry(3, () =>
      fetchPollTally(parseInt(pollId), voteType, false, network)
    );

    const maker = await getMaker(network);
    const votesByAddress: PollTallyVote[] = (
      await maker.service('govPolling').getMkrAmtVotedByAddress(pollId)
    ).sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner || '';
    const rounds = tally.rounds;
    const numVoters = tally.numVoters;

    const parsedTally = {
      options: tally.options,
      winner,
      rounds,
      totalMkrParticipation,
      numVoters,
      votesByAddress
    };

    res.setHeader('Cache-Control', cacheType);
    res.status(200).json(parsedTally);
  });
}

export { createPollTallyRoute };

export default createPollTallyRoute({
  cacheType: 's-maxage=5, stale-while-revalidate'
});
