/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { add } from 'date-fns';
import { utils } from 'ethers';
import logger from 'lib/logger';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { delegatorHistory } from 'modules/gql/queries/subgraph/delegatorHistory';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { isAboutToExpireCheck, isExpiredCheck } from 'modules/migration/helpers/expirationChecks';
import { DelegationHistoryWithExpirationDate, MKRDelegatedToResponse } from '../types';
import { getNewOwnerFromPrevious } from 'modules/migration/delegateAddressLinks';
import { Query, AllDelegatesRecord } from 'modules/gql/generated/graphql';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistoryWithExpirationDate[]> {
  try {
    // We fetch the delegates information from the DB to extract the expiry date of each delegate
    // TODO: This information could be aggregated in the "mkrDelegatedTo" query in gov-polling-db, and returned there, as an improvement.
    const chainId = networkNameToChainId(network);
    const delegatesData = await gqlRequest<Query>({ chainId, query: allDelegates });
    const delegates = delegatesData.allDelegates.nodes;

    // Returns the records with the aggregated delegated data
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      useSubgraph: true,
      query: delegatorHistory,
      variables: { address: address.toLowerCase() }
    });
    const res: MKRDelegatedToResponse[] = data.delegationHistories.map(x => {
      return {
        delegateContractAddress: x.delegate.id,
        lockAmount: x.amount,
        blockTimestamp: x.timestamp,
        hash: x.txnHash,
        blockNumber: x.blockNumber,
        immediateCaller: address
      };
    });

    const delegatedTo = res.reduce((acc, { delegateContractAddress, lockAmount, blockTimestamp, hash }) => {
      const existing = acc.find(({ address }) => address === delegateContractAddress) as
        | DelegationHistoryWithExpirationDate
        | undefined;

      // We sum the total of lockAmounts in different events to calculate the current delegated amount
      if (existing) {
        existing.lockAmount = utils.formatEther(utils.parseEther(existing.lockAmount).add(lockAmount));
        existing.events.push({ lockAmount: utils.formatEther(lockAmount), blockTimestamp, hash });
      } else {
        const delegatingTo = delegates.find(
          i => i?.voteDelegate?.toLowerCase() === delegateContractAddress.toLowerCase()
        ) as (AllDelegatesRecord & { version: number }) | undefined;

        if (!delegatingTo) {
          return acc;
        }

        const delegatingToWalletAddress = delegatingTo?.delegate?.toLowerCase();
        // Get the expiration date of the delegate

        const expirationDate =
          delegatingTo.version === 2
            ? undefined
            : add(new Date(delegatingTo?.blockTimestamp), { years: 1 });

        //only v1 delegate contracts expire
        const isAboutToExpire = delegatingTo.version !== 2 && isAboutToExpireCheck(expirationDate);
        const isExpired = delegatingTo.version !== 2 && isExpiredCheck(expirationDate);

        // If it has a new owner address, check if it has renewed the contract
        const newOwnerAddress = getNewOwnerFromPrevious(delegatingToWalletAddress as string, network);

        const newRenewedContract = newOwnerAddress
          ? delegates.find(d => d?.delegate?.toLowerCase() === newOwnerAddress.toLowerCase())
          : null;

        acc.push({
          address: delegateContractAddress,
          expirationDate,
          isExpired,
          isAboutToExpire: !isExpired && isAboutToExpire,
          lockAmount: utils.formatEther(lockAmount),
          isRenewed: !!newRenewedContract,
          events: [{ lockAmount: utils.formatEther(lockAmount), blockTimestamp, hash }]
        } as DelegationHistoryWithExpirationDate);
      }

      return acc;
    }, [] as DelegationHistoryWithExpirationDate[]);

    // Sort by lockAmount, lockAmount is the total amount delegated currently
    return delegatedTo.sort((prev, next) =>
      utils.parseEther(prev.lockAmount).gt(utils.parseEther(next.lockAmount)) ? -1 : 1
    );
  } catch (e) {
    logger.error('fetchDelegatedTo: Error fetching MKR delegated to address', e.message);
    return [];
  }
}
