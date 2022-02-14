import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { generateNonce } from 'modules/comments/api/nonce';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { voterAddress }: any = JSON.parse(req.body);
    console.log('eee', voterAddress);
    invariant(voterAddress && voterAddress.length > 0, 'Missing address');
    const nonce = await generateNonce(voterAddress);

    res.status(200).json({ nonce });
  },
  { allowPost: true }
);
