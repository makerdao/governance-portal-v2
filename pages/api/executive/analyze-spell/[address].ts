import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from '../../../../lib/maker';
import { DEFAULT_NETWORK } from '../../../../lib/constants';
import withApiHandler from '../../_lib/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const provider = ethers.getDefaultProvider(network);
  const encoder = new ethers.utils.Interface(['function eta() returns (uint256)']);

  async function ethCall(method) {
    return encoder.decodeFunctionResult(
      method,
      await provider.call({
        to: spellAddress,
        data: encoder.encodeFunctionData(method)
      })
    );
  }

  const [eta] = await ethCall('eta');
  const hasBeenCast = eta.gt(0);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json({ hasBeenCast });
});
