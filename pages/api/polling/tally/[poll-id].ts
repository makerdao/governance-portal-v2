import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

import withApiHandler from 'lib/api/withApiHandler';
import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import { backoffRetry } from 'lib/utils';
import { fetchPollTally } from 'modules/polls/api/fetchPollTally';
import { RawPollTally } from 'modules/polls/types';

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse<RawPollTally>) => {
    const pollId = req.query['poll-id'] as string;
    const network = (req.query.network as string) || DEFAULT_NETWORK;

    invariant(pollId, 'poll id required');
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const tally: RawPollTally = await backoffRetry(3, () => fetchPollTally(parseInt(pollId), network));

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner || '';
    const rounds = tally.rounds;
    const numVoters = tally.numVoters;

    const parsedTally = {
      options: tally.options,
      winner,
      rounds,
      totalMkrParticipation,
      numVoters
    };

    res.setHeader('Cache-Control', cacheType);
    res.status(200).json(parsedTally);
  });
}

export { createPollTallyRoute };

export default createPollTallyRoute({
  cacheType: 's-maxage=5, stale-while-revalidate'
});
