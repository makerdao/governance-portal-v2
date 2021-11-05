import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { getExecutiveProposal } from 'modules/executive/api/fetchExecutives';
import { CMSProposal } from 'modules/executive/types';
import { NotFoundResponse } from 'modules/app/types/genericApiResponse';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<CMSProposal | NotFoundResponse>) => {
    const network = (req.query.network as string) || DEFAULT_NETWORK;
    const proposalId = req.query['proposal-id'] as string;
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const response = await getExecutiveProposal(proposalId, network);

    if (!response) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(response);
  }
);
