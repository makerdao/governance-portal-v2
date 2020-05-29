import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

import withApiHandler from '../../_lib/with-api-handler';
import { networkToRpc, isSupportedNetwork } from '../../../../lib/maker';
import { DEFAULT_NETWORK, SupportedNetworks } from '../../../../lib/constants';
import { backoffRetry } from '../../../../lib/utils';

const cachedMakerObjs = {};
async function getConnectedMakerObj(network: SupportedNetworks) {
  if (cachedMakerObjs[network]) {
    return cachedMakerObjs[network];
  }

  const makerObj = await Maker.create('http', {
    plugins: [[GovernancePlugin, { network }]],
    provider: {
      url: networkToRpc(network),
      type: 'HTTP'
    },
    web3: {
      pollingInterval: null
    },
    log: false,
    multicall: true
  });

  cachedMakerObjs[network] = makerObj;
  return makerObj;
}

function createPollTallyRoute({ cacheType }: { cacheType: string }) {
  return withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
    const pollId: string = req.query['poll-id'] as string;
    const network: string = req.query.network as string;

    invariant(pollId, 'poll id required');

    const maker = await getConnectedMakerObj(
      isSupportedNetwork(network) ? (network as SupportedNetworks) : DEFAULT_NETWORK
    );

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
  cacheType: 's-maxage=5, stale-while-revalidate'
});
