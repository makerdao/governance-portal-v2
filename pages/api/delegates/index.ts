import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const sortBy = validateQueryParam(req.query.sortBy, 'string', {
    defaultValue: 'random',
    validValues: ['random', 'mkr', 'delegators', 'date']
  });

  const delegates = await fetchDelegates(network, sortBy as any);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(delegates);
});
