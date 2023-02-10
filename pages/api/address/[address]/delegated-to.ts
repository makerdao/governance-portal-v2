/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatedTo } from 'modules/delegates/api/fetchDelegatedTo';
import { DelegationHistoryWithExpirationDate } from 'modules/delegates/types';
import BigNumber from 'lib/bigNumberJs';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
/**
 * @swagger
 * 
 * paths:
 * api/address/[address]/delegated-to:
  get:
    description: Retrieve MKR delegated to information
    parameters:
      - in: query
        name: network
        description: Network to fetch the data from
        schema:
          type: string
        enum: [goerli, mainnet]
        required: false
      - in: query
        name: address
        description: Ethereum address to retrieve delegated MKR information for
        schema:
          type: string
        required: true
    responses:
      200:
        description: OK
        content:
          application/json:
            schema:
              type: object
              properties:
                delegatedTo:
                  type: array
                  items:
                    type: object
                    properties:
                      events:
                        type: array
                        items:
                          type: object
                      lockAmount:
                        type: string
                totalDelegated:
                  type: integer

 */
export type MKRDelegatedToAPIResponse = {
  delegatedTo: DelegationHistoryWithExpirationDate[];
  totalDelegated: number;
};
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<MKRDelegatedToAPIResponse>) => {
    // validate network
    const network = validateQueryParam(
      (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
      'string',
      {
        defaultValue: null,
        validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
      },
      n => !!n,
      new ApiError('Invalid network', 400, 'Invalid network')
    ) as SupportedNetworks;

    // validate address
    const address = await validateAddress(
      req.query.address as string,
      new ApiError('Invalid address', 400, 'Invalid address')
    );
    const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

    const proxyInfo = await getVoteProxyAddresses(contracts.voteProxyFactory, address, network);

    // if hasProxy, we need to combine the delegation history of hot, cold, proxy
    let delegatedTo: DelegationHistoryWithExpirationDate[];

    if (proxyInfo.hasProxy && proxyInfo.coldAddress && proxyInfo.hotAddress && proxyInfo.voteProxyAddress) {
      const [coldHistory, hotHistory, proxyHistory] = await Promise.all([
        fetchDelegatedTo(proxyInfo.coldAddress, network),
        fetchDelegatedTo(proxyInfo.hotAddress, network),
        fetchDelegatedTo(proxyInfo.voteProxyAddress, network)
      ]);
      delegatedTo = coldHistory.concat(hotHistory).concat(proxyHistory);
    } else {
      delegatedTo = await fetchDelegatedTo(address, network);
    }

    // filter out duplicate txs
    const txHashes = {};
    const filtered = delegatedTo.filter(historyItem => {
      let duplicateFound = false;
      historyItem.events.forEach(event => {
        if (txHashes[event.hash]) duplicateFound = true;
        txHashes[event.hash] = true;
      });
      return !duplicateFound;
    });

    const totalDelegated = filtered.reduce((prev, next) => {
      return prev.plus(next.lockAmount);
    }, new BigNumber(0));

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      delegatedTo: filtered,
      totalDelegated: totalDelegated.toNumber()
    });
  }
);
