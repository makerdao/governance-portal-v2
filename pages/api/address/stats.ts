import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { resolveENS } from 'modules/web3/helpers/ens';

/**
 * @swagger
 * definitions:
 *   ArrayOfVoteHistory:
 *     type: array
 *     items:
 *       $ref: '#/definitions/VoteHistory'
 *   VoteHistory:
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *       blockTimestamp:
 *         type: string
 *       option:
 *         type: number
 *       optionValue:
 *         type: array
 *         items:
 *           type: string
 *       rankedChoiceOption:
 *         type: array
 *         items:
 *           type: integer
 *       poll:
 *         $ref: '#/definitions/Poll'
 *     example:
 *       - pollId: 1
 *         blockTimestamp: "2021-11-20T19:25:47+00:00"
 *         option: 1
 *         optionValue: ["Yes"]
 *         rankedChoiceOption: [1]
 *         poll:
 *           pollId: 1
 *   AddressStats:
 *     type: object
 *     properties:
 *       pollVoteHistory:
 *         $ref: '#/definitions/ArrayOfVoteHistory'
 *       lastVote:
 *         $ref: '#/definitions/VoteHistory'
 *
 * /api/address/stats:
 *   get:
 *     tags:
 *     - "address"
 *     description: Returns stats for address
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Address to check
 *     responses:
 *       '200':
 *         description: "Stats of the address"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AddressStats'
 *
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  const tempAddresses =
    typeof req.query.address === 'string'
      ? [req.query.address.toLowerCase()]
      : (req.query.address as string[]);

  if (!req.query.address) {
    return res.status(400).json({
      error: 'Missing address'
    });
  }

  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  try {
    const addresses = await Promise.all(
      tempAddresses.map(async tempAddress => {
        return tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
      })
    );

    const pollVoteHistories = await Promise.all(
      addresses
        .filter(a => !!a)
        .map(async (address: string) => {
          const pollVoteHistory = await fetchAddressPollVoteHistory(address, network);

          return pollVoteHistory;
        })
    );

    const combinedPollVoteHistory = pollVoteHistories.flat();
    const response: AddressAPIStats = {
      pollVoteHistory: combinedPollVoteHistory,
      lastVote: combinedPollVoteHistory.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))[0]
    };

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
  }
});
