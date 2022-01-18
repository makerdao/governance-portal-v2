import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { resolveENS } from 'modules/web3/ens';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';

/**
 * @swagger
 * definitions:
 *   Address:
 *     type: object
 *     properties:
 *       isDelegate:
 *         type: boolean
 *       isProxyContract:
 *         type: boolean
 *       address:
 *         type: string
 *       delegateInfo:
 *         type: object
 *         properties:
 *           voteDelegateAddress:
 *             type: string
 *           id:
 *             type: string
 *           mkrDelegated:
 *             type: number
 *     example:
 *       - address: "0x7a1231231312d76A2aff3b1231231230A4"
 *         isDelegate: true
 *         isProxyContract: false
 *         delegateInfo:
 *           mkrDelegated: 5
 *           voteDelegateAddress: "0x123123213213"
 * /api/address/{address}:
 *   get:
 *     tags:
 *     - "address"
 *     description: Returns the address info
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: address to check
 *     responses:
 *       '200':
 *         description: "Detail of an address"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Address'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const tempAddress = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
  const response = await getAddressInfo(address ?? tempAddress, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
