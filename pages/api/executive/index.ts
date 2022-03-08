import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';

import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { Proposal } from 'modules/executive/types';
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
 *     - name: "start"
 *       in: "query"
 *       description: "start index"
 *       required: false
 *       type: "number"
 *       default: 0
 *     - name: "limit"
 *       in: "query"
 *       description: "limit index"
 *       required: false
 *       type: "number"
 *       default: 10
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
 *             type: object
 *               properties:
 *                 total:
 *                   type: "number"
 *                 proposals:
 *                   schema:
 *                     $ref: '#/definitions/ArrayOfExecutives'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<Proposal[]>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  const start = req.query.start ? parseInt(req.query.start as string, 10) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const response = await getExecutiveProposals(start, limit, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
