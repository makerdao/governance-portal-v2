import withApiHandler from 'modules/app/api/withApiHandler';
import fetchAllLocksSummed from 'modules/home/api/fetchAllLocksSummed';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  const unixtimeStart = req.query.unixtimeStart as string;
  const unixtimeEnd = req.query.unixtimeEnd as string;

  invariant(unixtimeStart, 'unixtimeStart is required');
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const data = await fetchAllLocksSummed(
    network,
    parseInt(unixtimeStart),
    unixtimeEnd ? parseInt(unixtimeEnd) : Math.floor(Date.now() / 1000)
  );

  if (!data) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(data);
});
