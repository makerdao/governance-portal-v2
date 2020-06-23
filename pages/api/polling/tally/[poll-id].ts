import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

import withApiHandler from '../../_lib/withApiHandler';
import { getConnectedMakerObj } from '../../_lib/utils';
import { isSupportedNetwork } from '../../../../lib/maker';
import { DEFAULT_NETWORK } from '../../../../lib/constants';
import { backoffRetry } from '../../../../lib/utils';

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    const pollId = req.query['poll-id'] as string;
    const network = (req.query.network as string) || DEFAULT_NETWORK;

    invariant(pollId, 'poll id required');
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const maker = await getConnectedMakerObj(network);
    const tally = await backoffRetry(3, () => maker.service('govPolling').getTallyRankedChoiceIrv(pollId));

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner;
    const rounds = parseInt(tally.rounds);

    const parsedTally = {
      options: tally.options,
      winner,
      rounds,
      totalMkrParticipation
    };

    res.setHeader('Cache-Control', cacheType);
    res.status(200).json(parsedTally);
  });
}

export { createPollTallyRoute };

export default createPollTallyRoute({
  cacheType: 's-maxage=15, stale-while-revalidate'
});
