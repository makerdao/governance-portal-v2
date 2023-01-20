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
import { resolveENS } from 'modules/web3/helpers/ens';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { ApiError } from 'modules/app/api/ApiError';
import { isValidAddressParam } from 'pages/api/polling/isValidAddressParam';
import validateQueryParam from 'modules/app/api/validateQueryParam';

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
      }
    ) as SupportedNetworks;

    if (!network) {
      throw new ApiError('Invalid network', 400, 'Invalid network');
    }

    // validate address
    if (!req.query.address) {
      throw new ApiError('Address stats, missing address', 400, 'Missing address');
    }

    if (!isValidAddressParam(req.query.address as string)) {
      throw new ApiError('Invalid address', 400, 'Invalid address');
    }

    const tempAddress = req.query.address as string;

    const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;

    const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

    const proxyInfo = await getVoteProxyAddresses(
      contracts.voteProxyFactory,
      address ?? tempAddress,
      network
    );

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
      delegatedTo = await fetchDelegatedTo(address ?? tempAddress, network);
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
