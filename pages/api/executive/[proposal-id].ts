import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getExecutiveProposal } from 'modules/executive/api/fetchExecutives';
import { CMSProposal } from 'modules/executive/types';
import { NotFoundResponse } from 'modules/app/types/genericApiResponse';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { API_ERROR_CODES } from 'modules/app/constants/apiErrors';
import { ApiError } from 'modules/app/api/ApiError';

/**
 * @swagger
 * definitions:
 *   Executive:
 *     type: object
 *     properties:
 *       about:
 *         type: string
 *       content:
 *         type: string
 *       title:
 *         type: string
 *       proposalBlurb:
 *         type: string
 *       key:
 *         type: string
 *       address:
 *         type: string
 *       date:
 *         type: string
 *       active:
 *         type: boolean
 *       proposalLink:
 *         type: string
 *     example:
 *       - about: "markdown"
 *         content: 'markdown'
 *         title: "The example executive"
 *         proposalBlurb: "Example"
 *         key: "executive-number-3"
 *         address: '0x000000'
 *         date: "Fri Sep 17 2021 00:00:00 GMT+0000 (Coordinated Universal Time)"
 *         active: false
 *         proposalLink: 'https://linktogithubrawcontent'
 *
 * /api/executive/{key}:
 *   get:
 *     tags:
 *     - "executive"
 *     description: Returns a executive detail
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Key of the executive
 *     responses:
 *       '200':
 *         description: "Detail of a Executive"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/Executive'
 */
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<CMSProposal | NotFoundResponse>) => {
    const network = (req.query.network as string) || DEFAULT_NETWORK.network;
    const proposalId = req.query['proposal-id'] as string;
    invariant(isSupportedNetwork(network), `unsupported network ${network}`);

    const response = await getExecutiveProposal(proposalId, network);

    if (!response) {
      throw new ApiError(`GET /api/executive/${proposalId}`, 404, 'Proposal not found');
    }

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(response);
  }
);
