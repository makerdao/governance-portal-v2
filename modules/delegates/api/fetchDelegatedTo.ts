import { add } from 'date-fns';
import { utils } from 'ethers';
import logger from 'lib/logger';
import { Query } from 'modules/gql/generated/graphql';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { allDelegates } from 'modules/gql/queries/allDelegates';
import { mkrDelegatedToV2 } from 'modules/gql/queries/mkrDelegatedTo';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { isAboutToExpireCheck, isExpiredCheck } from 'modules/migration/helpers/expirationChecks';
import { DelegationHistoryWithExpirationDate, MKRDelegatedToDAIResponse } from '../types';
import { getNewOwnerFromPrevious } from 'modules/migration/delegateAddressLinks';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistoryWithExpirationDate[]> {
  try {
    // Returns the records with the aggregated delegated data
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: mkrDelegatedToV2,
      variables: { argAddress: address.toLowerCase() }
    });
    // We fetch the delegates information from the DB to extract the expiry date of each delegate
    // TODO: This information could be aggregated in the "mkrDelegatedTo" query in gov-polling-db, and returned there, as an improvement.
    const chainId = networkNameToChainId(network);
    const delegatesData = await gqlRequest<Query>({ chainId, query: allDelegates });
    const delegates = delegatesData.allDelegates.nodes;

    const res: MKRDelegatedToDAIResponse[] = data.mkrDelegatedToV2.nodes;
    const delegatedTo = res.reduce((acc, { delegateContractAddress, lockAmount, blockTimestamp, hash }) => {
      const existing = acc.find(({ address }) => address === delegateContractAddress) as
        | DelegationHistoryWithExpirationDate
        | undefined;

      // We sum the total of lockAmounts in different events to calculate the current delegated amount
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
        existing.events.push({ lockAmount, blockTimestamp, hash });
      } else {
        const delegatingTo = delegates.find(
          i => i?.voteDelegate?.toLowerCase() === delegateContractAddress.toLowerCase()
        );

        const delegatingToWalletAddress = delegatingTo?.delegate?.toLowerCase();
        // Get the expiration date of the delegate

        const expirationDate = add(new Date(delegatingTo?.blockTimestamp), { years: 1 });

        const isAboutToExpire = isAboutToExpireCheck(expirationDate);
        const isExpired = isExpiredCheck(expirationDate);

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
          lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
          isRenewed: !!newRenewedContract,
          events: [{ lockAmount, blockTimestamp, hash }]
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
