import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { resolveENS } from 'modules/web3/helpers/ens';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';

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
 * /api/address/{address}/stats:
 *   get:
 *     tags:
 *     - "address"
 *     description: Returns stats for address
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
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
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressAPIStats>) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  const tempAddress = req.query.address as string;
  const delegate = req.query.delegate as string;
  const prevDelegateAddress = req.query.prev as string;

  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  try {
    const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;

    // check vote proxy info if not fetching delegate history
    let contracts;
    let voteProxyAddress;
    if (!delegate) {
      contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);
      voteProxyAddress = await getVoteProxyAddresses(contracts.voteProxyFactory, address as string, network);
    }

    const pollVoteHistory = await fetchAddressPollVoteHistory(
      voteProxyAddress?.hotAddress ?? (address as string),
      network
    );

    // TODO: update for multiple previous contracts
    let prevContractVoteHistory: PollVoteHistory[] = [];
    if (prevDelegateAddress) {
      const prevHistory = await fetchAddressPollVoteHistory(prevDelegateAddress, network);
      prevContractVoteHistory = prevContractVoteHistory.concat(prevHistory);
    }

    const combinedPollVoteHistory = pollVoteHistory.concat(prevContractVoteHistory);
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
