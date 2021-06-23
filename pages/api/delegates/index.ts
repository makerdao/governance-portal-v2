import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegatesGithub } from 'lib/delegates/fetchDelegates';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  // const maker = await getConnectedMakerObj(network);
  const delegates = await fetchDelegatesGithub();
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(delegates);
});
