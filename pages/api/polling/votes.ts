import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchLatestVotes } from 'modules/polling/api/fetchLatestVotes';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';

//TODO: add swagger documentation
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const start = validateQueryParam(req.query.start, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  const limit = validateQueryParam(req.query.limit, 'number', {
    defaultValue: 10,
    minValue: 1,
    maxValue: 30
  }) as number;

  const votes = await fetchLatestVotes(network, start, limit);
  return res.status(200).json(votes);
});
