import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { generateNonce } from 'modules/comments/api/nonce';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { address }: any = req.body;
    invariant(address && address.length > 0, 'Missing address');
    const nonce = await generateNonce(address);

    res.status(200).json({ nonce });
  },
  { allowPost: true }
);
