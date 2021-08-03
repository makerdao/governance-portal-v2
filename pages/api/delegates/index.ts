import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegates } from 'lib/delegates/fetchDelegates';
import { DelegatesAPIResponse } from 'types/delegatesAPI';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const delegates = await fetchDelegates(network);
  
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(delegates);
});
