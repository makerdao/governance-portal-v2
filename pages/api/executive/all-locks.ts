import withApiHandler from 'modules/app/api/withApiHandler';
import fetchAllLocksSummed from 'modules/home/api/fetchAllLocksSummed';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const unixtimeStart = req.query.unixtimeStart as string;
  const unixtimeEnd = req.query.unixtimeEnd as string;

  invariant(unixtimeStart, 'unixtimeStart is required');

  const data = await fetchAllLocksSummed(
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
