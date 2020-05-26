import Maker from '@makerdao/dai';
import GovernancePlugin from '@makerdao/dai-plugin-governance';

import withApiHandler from '../../_lib/with-api-handler';
import { networkToRpc, isSupportedNetwork } from '../../../../lib/maker';
import { DEFAULT_NETWORK } from '../../../../lib/constants';
import { backoffRetry } from '../../../../lib/utils';

const cachedMakerObjs = {};
async function getConnectedMakerObj(network) {
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

function creatPollTallyRoute({ cacheType }) {
  return withApiHandler(async (req, res) => {
    const {
      query: { ['poll-id']: pollId, network }
    } = req;
    const maker = await getConnectedMakerObj(
      isSupportedNetwork(network) ? network : DEFAULT_NETWORK
    );

    const tally = await backoffRetry(3, () =>
      maker.service('govPolling').getTallyRankedChoiceIrv(pollId)
    );

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner = tally.winner;
    const rounds = tally.rounds;

    res.setHeader('Cache-Control', cacheType);
    res
      .status(200)
      .json({ options: tally.options, winner, rounds, totalMkrParticipation });
  });
}

export { creatPollTallyRoute };

export default creatPollTallyRoute({
  cacheType: 's-maxage=5, stale-while-revalidate'
});
