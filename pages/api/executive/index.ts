import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';

import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { CMSProposal } from 'modules/executive/types';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<CMSProposal[]>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const response = await getExecutiveProposals(network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
