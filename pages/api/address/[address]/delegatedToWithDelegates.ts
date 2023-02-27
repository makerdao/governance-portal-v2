/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatedTo } from 'modules/delegates/api/fetchDelegatedTo';
import {
  DelegateNameAndMetrics,
  DelegationHistory,
  DelegationHistoryWithExpirationDate
} from 'modules/delegates/types';
import BigNumber from 'lib/bigNumberJs';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
import { fetchDelegateNamesAndMetrics } from 'modules/delegates/api/fetchDelegates';

export type MKRDelegatedToWithDelegateAPIResponse = {
  totalDelegated: number;
  delegatedTo: DelegationHistory[];
  delegates: DelegateNameAndMetrics[];
};
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<MKRDelegatedToWithDelegateAPIResponse>) => {
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
    const filtered = delegatedTo
      .filter(historyItem => {
        let duplicateFound = false;
        historyItem.events.forEach(event => {
          if (txHashes[event.hash]) duplicateFound = true;
          txHashes[event.hash] = true;
        });
        return !duplicateFound;
      })
      .map(({ address, lockAmount, events }) => ({ address, lockAmount, events }));

    const delegateNamesAndMetrics = await fetchDelegateNamesAndMetrics(network, false, true);
    const delegatesDelegatedTo = delegateNamesAndMetrics.filter(({ voteDelegateAddress }) =>
      filtered.some(({ address }) => address.toLowerCase() === voteDelegateAddress.toLowerCase())
    );
    const delegatesAndNextContracts = [
      ...delegatesDelegatedTo,
      ...(delegatesDelegatedTo
        .map(({ next }) =>
          delegateNamesAndMetrics.find(
            d => d.voteDelegateAddress.toLowerCase() === next?.voteDelegateAddress.toLowerCase()
          )
        )
        .filter(delegate => !!delegate) as DelegateNameAndMetrics[])
    ];

    const totalDelegated = filtered.reduce((prev, next) => {
      return prev.plus(next.lockAmount);
    }, new BigNumber(0));

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      totalDelegated: totalDelegated.toNumber(),
      delegatedTo: filtered,
      delegates: delegatesAndNextContracts
    });
  }
);
