import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';
import BigNumber from 'bignumber.js';
import withApiHandler from 'lib/api/withApiHandler';
import { getConnectedMakerObj } from 'lib/api/utils';
import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import { backoffRetry } from 'lib/utils';
import { PollTallyVote } from 'types/pollTally';

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    const pollId = req.query['poll-id'] as string;
    const network = (req.query.network as string) || DEFAULT_NETWORK;

    invariant(pollId, 'poll id required');
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const maker = await getConnectedMakerObj(network);
    const tally = await backoffRetry(3, () => maker.service('govPolling').getTallyRankedChoiceIrv(pollId));
    const votesByAddress: PollTallyVote[] = (
      await maker.service('govPolling').getMkrAmtVotedByAddress(pollId)
    ).sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner;
    const rounds = parseInt(tally.rounds);
    const numVoters = parseInt(tally.numVoters);

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
