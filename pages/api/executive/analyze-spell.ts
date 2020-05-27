// placeholder, not currently being used
import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import withApiHandler from '../_lib/with-api-handler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const address: string = req.query.address as string;

  invariant(address, 'spell address required');

  res.status(200).json({ address });
});
