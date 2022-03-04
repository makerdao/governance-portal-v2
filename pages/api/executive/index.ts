import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';

import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { CMSProposal } from 'modules/executive/types';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';

/**
 * @swagger
 * definitions:
 *   ArrayOfExecutives:
 *     type: array
 *     items:
 *       $ref: '#/definitions/Executive'
 * /api/executive:
 *   get:
 *     tags:
 *     - "executive"
 *     description: Returns all executive proposals
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "network"
 *       in: "query"
 *       description: "Network"
 *       required: false
 *       type: "array"
 *       items:
 *         type: "string"
 *         enum:
 *         - "goerli"
 *         - "mainnet"
 *         default: ""
 *     - name: "active"
 *       in: "query"
 *       description: "Filter by active"
 *       required: false
 *       type: "boolean"
 *       collectionFormat: "multi"
 *     responses:
 *       '200':
 *         description: "List of executives"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ArrayOfExecutives'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<CMSProposal[]>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const response = await getExecutiveProposals(network);

  const active = req.query.active ? req.query.active === 'true' : false;

  if (active) {
    return res.status(200).json(response.filter(i => i.active));
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
