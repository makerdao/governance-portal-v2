import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import withApiHandler from 'lib/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'lib/constants';
import { getExecutiveComments } from 'modules/comments/api/getExecutiveComments';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;
  invariant(network && network.length > 0, 'Network not supported');

  const response = await getExecutiveComments(spellAddress, network);
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

  res.status(200).json(response);
});
