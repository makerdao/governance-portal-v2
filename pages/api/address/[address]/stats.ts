import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import getMaker from 'lib/maker';
import voteProxyFactoryAbi from 'lib/abis/voteProxyAbi.json';
import { isSupportedNetwork } from 'lib/maker/index';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { resolveENS } from 'modules/web3/ens';

/**
 * @swagger
 * definitions:
 *   AddressStats:
 *     type: object
 *     properties:
 *       pollVoteHistory:
 *         type: integer
 *       lastVote:
 *         type: string
 *     example:
 *       - pollVoteHistory: 1
 *         lastVote: '0x123123'
 *
 * /api/[address]/stats:
 *   get:
 *     tags:
 *     - "address"
 *     description: Returns stats for address
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "address"
 *       in: "query"
 *       description: "Address"
 *       required: true
 *       type: "string"
 *     responses:
 *       '200':
 *         description: "Stats of the address"
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 $ref: '#/definitions/AddressStats'
 *
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressAPIStats>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  const tempAddress = req.query.address as string;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
  const maker = await getMaker(network);
  const voteProxyContract = maker
    .service('smartContract')
    .getContractByAddressAndAbi(address, voteProxyFactoryAbi);

  // TODO: should we check cold for history?
  let hot;
  let cold;
  let voteProxyAddress;
  try {
    hot = await voteProxyContract.hot();
    cold = await voteProxyContract.cold();
    voteProxyAddress = address;
  } catch (err) {
    // console.log(err);
  }

  const pollVoteHistory = await fetchAddressPollVoteHistory(hot ? hot : address, network);

  const response: AddressAPIStats = {
    pollVoteHistory,
    lastVote: pollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0]
  };

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
