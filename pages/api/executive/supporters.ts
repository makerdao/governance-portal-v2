import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from '../../../lib/maker';
import { getConnectedMakerObj } from '../_lib/utils';
import { DEFAULT_NETWORK } from '../../../lib/constants';
import withApiHandler from '../_lib/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getConnectedMakerObj(network);
  const allSupporters = await maker.service('chief').getVoteTally();

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(allSupporters);
});
