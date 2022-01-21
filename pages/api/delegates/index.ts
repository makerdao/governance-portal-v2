import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';

import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  const delegates = await fetchDelegates(network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(delegates);
});
