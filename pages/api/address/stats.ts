/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressStatsCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';

/**
 * @swagger
 * definitions:
 *   Poll: # Based on PollListItem
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *         description: Unique identifier for the poll.
 *       multiHash:
 *         type: string
 *         description: IPFS multihash of the poll content.
 *       slug:
 *         type: string
 *         description: Short URL-friendly identifier for the poll.
 *       title:
 *         type: string
 *         description: Title of the poll.
 *       summary:
 *         type: string
 *         nullable: true
 *         description: A brief summary of the poll.
 *       discussionLink:
 *         type: string
 *         nullable: true
 *         description: Link to the discussion forum for the poll.
 *       parameters:
 *         type: object
 *         description: Parameters defining how the poll works (e.g., input format, victory conditions).
 *       options:
 *         type: object
 *         description: Key-value pairs of option identifiers and their text.
 *         additionalProperties:
 *           type: string
 *         example:
 *           "0": "Abstain"
 *           "1": "Yes"
 *           "2": "No"
 *       startDate:
 *         type: string
 *         format: date-time
 *         description: ISO8601 string representing the start date of the poll.
 *       endDate:
 *         type: string
 *         format: date-time
 *         description: ISO8601 string representing the end date of the poll.
 *       url:
 *         type: string
 *         nullable: true
 *         description: URL to the full content of the poll, often a raw GitHub link.
 *       type:
 *         type: string
 *         description: The input format type for the poll (e.g., singleChoice, rankFree).
 *       tags:
 *         type: array
 *         items:
 *           type: string
 *         nullable: true
 *         description: Tags associated with the poll.
 *   VoteHistory: # Based on PollVoteHistory (PollTallyVote & { poll, optionValue })
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *         description: Identifier of the poll this vote belongs to.
 *       voter:
 *         type: string
 *         format: address
 *         description: Address of the voter.
 *       ballot:
 *         type: array
 *         items:
 *           type: integer
 *         description: Array of chosen option indices by the voter.
 *       mkrSupport:
 *         type: string # Represents number | string, string is safer for large numbers
 *         description: MKR voting weight associated with this vote.
 *       chainId:
 *         type: integer
 *         description: Chain ID where the vote was cast.
 *       blockTimestamp:
 *         type: string
 *         format: date-time
 *         description: Timestamp of the block when the vote was cast (ISO8601 string).
 *       hash:
 *         type: string
 *         description: Transaction hash of the vote.
 *       poll:
 *         $ref: '#/definitions/Poll'
 *       optionValue:
 *         type: array
 *         items:
 *           type: string
 *         description: Textual representation of the chosen option(s).
 *     example:
 *       pollId: 1
 *       voter: "0x123abc456def7890123abc456def7890123abc45"
 *       ballot: [1]
 *       mkrSupport: "100.50"
 *       chainId: 1
 *       blockTimestamp: "2021-11-20T19:25:47Z"
 *       hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *       poll:
 *         pollId: 1
 *         title: "Sample Poll: Should we implement feature X?"
 *         startDate: "2021-11-18T16:00:00Z"
 *         endDate: "2021-11-25T16:00:00Z"
 *         options:
 *           "0": "Abstain"
 *           "1": "Yes"
 *           "2": "No"
 *         # ... other poll fields as per Poll definition
 *       optionValue: ["Yes"]
 *   ArrayOfVoteHistory:
 *     type: array
 *     items:
 *       $ref: '#/definitions/VoteHistory'
 *   AddressStats: # Based on AddressAPIStats
 *     type: object
 *     properties:
 *       pollVoteHistory:
 *         $ref: '#/definitions/ArrayOfVoteHistory'
 *       lastVote:
 *         $ref: '#/definitions/VoteHistory'
 *         nullable: true # lastVote can be undefined if pollVoteHistory is empty
 *
 * /api/address/stats:
 *   get:
 *     tags:
 *     - "address"
 *     summary: Returns polling stats for a given address (or multiple addresses).
 *     description: Retrieves poll vote history and the last vote cast by the specified Ethereum address(es).
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string # While the API can handle string[], Swagger defines as string for simplicity.
 *                        # For multiple addresses, they can be passed as repeated query params: address=0x1&address=0x2
 *         required: true
 *         description: Ethereum address to check. Can be supplied multiple times for multiple addresses.
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [mainnet, tenderly]
 *           default: mainnet
 *         required: false
 *         description: The Ethereum network to query.
 *     responses:
 *       '200':
 *         description: "Polling statistics for the address(es)."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AddressStats'
 *
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // validate network
  const network = validateQueryParam(
    (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
    'string',
    {
      defaultValue: null,
      validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
    },
    n => !!n,
    new ApiError('Invalid network', 400, 'Invalid network')
  ) as SupportedNetworks;

  // Make sure the address exists
  const tmpAddresses = typeof req.query.address === 'string' ? [req.query.address] : req.query.address || [];
  const addresses = await Promise.all(
    tmpAddresses
      ?.filter(i => !!i)
      .map(tmpAddress =>
        validateAddress(tmpAddress, new ApiError('Address stats, Invalid address', 400, 'Invalid address'))
      )
  );

  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const cacheKey = getAddressStatsCacheKey(addresses);

  const cachedResponse = await cacheGet(cacheKey, network);
  if (cachedResponse) {
    return res.status(200).json(JSON.parse(cachedResponse));
  }

  const pollVoteHistories = await Promise.all(
    addresses.map(async (address: string) => {
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
  cacheSet(cacheKey, JSON.stringify(response), network, TEN_MINUTES_IN_MS);
  res.status(200).json(response);
});
