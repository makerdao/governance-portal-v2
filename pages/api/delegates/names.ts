import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';

import { fetchDelegatesInformation } from 'modules/delegates/api/fetchDelegates';
import { Delegate } from 'modules/delegates/types';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';

// Returns only the onchain + github info of delegates,
// Does not return stats or poll vote history
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<Delegate[]>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  const delegates = await fetchDelegatesInformation(network);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json(delegates);
});
