import withApiHandler from 'modules/app/api/withApiHandler';
import fetchAllLocksSummed from 'modules/home/api/fetchAllLocksSummed';
import { NextApiRequest, NextApiResponse } from 'next';
// import invariant from 'tiny-invariant';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  //   const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  //   invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  //   const slug = req.query.slug as string;

  const data = await fetchAllLocksSummed();

  if (!data) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(data);
});
