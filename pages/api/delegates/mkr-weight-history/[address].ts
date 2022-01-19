import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';

import { MKRWeightTimeRanges } from 'modules/delegates/delegates.constants';
import { fetchDelegatesMKRWeightHistory } from 'modules/delegates/api/fetchMKRWeightHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const range = req.query.range as MKRWeightTimeRanges;
  const from = parseInt(req.query.from as string) || ONE_YEAR;
  const address = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const data = await fetchDelegatesMKRWeightHistory(address, from, range, network);
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(data);
});
