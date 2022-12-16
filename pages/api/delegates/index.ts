import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { SortDelegates } from 'modules/delegates/types/sortDelegates';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const sortBy = validateQueryParam(req.query.sortBy, 'string', {
    defaultValue: SortDelegates.random,
    validValues: [SortDelegates.random, SortDelegates.mkr, SortDelegates.delegators, SortDelegates.date]
  });

  // TODO: Enable if we add pagination on the lowest level (gov-polling-db) with complex queries like mkr delegated and delegators
  // const start = validateQueryParam(req.query.start, 'number', {
  //   defaultValue: 0,
  //   minValue: 0
  // }) as number;

  // const limit = validateQueryParam(req.query.limit, 'number', {
  //   defaultValue: 10,
  //   minValue: 1,
  //   maxValue: 30
  // }) as number;

  const delegates = await fetchDelegates(network, sortBy as SortDelegates);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(delegates);
});
