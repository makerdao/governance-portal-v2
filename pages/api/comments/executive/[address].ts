import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import withApiHandler from 'lib/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'lib/constants';
import { getExecutiveComments } from 'modules/comments/api/getExecutiveComments';

/**
 * @swagger
 * definitions:
 *   ExecutiveComment:
 *     type: object
 *     properties:
 *       network:
 *         type: number
 *         enum: ['mainnet', 'goerli']
 *       spellAddress:
 *         type: string
 *       comment:
 *         type: string
 *       date:
 *         type: string
 *       voterAddress:
 *         type: string
 *       delegateAddress:
 *         type: string
 *       voterWeight:
 *         type: string
 *     example:
 *       - spellAddress: "0x123123123123"
 *         comment: 'This is a great comment'
 *         network: "mainnet"
 *         date: "2021-12-15T11:11:23.841Z"
 *         voterAddress: "0x123123212"
 *         delegateAddress: "0x12312321321"
 *         voterWeight: "4.223"
 *
 * /api/comments/executive/{address}:
 *   get:
 *     tags:
 *     - "comments"
 *     description: Returns all the comments for an executive
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Proposal address
 *     responses:
 *       '200':
 *         description: "Comments of an executive"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     $ref: '#/definitions/ExecutiveComment'
 *                   address:
 *                     $ref: '#/definitions/Address'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;
  invariant(network && network.length > 0, 'Network not supported');

  const response = await getExecutiveComments(spellAddress, network);
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

  res.status(200).json(response);
});
