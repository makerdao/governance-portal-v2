import { BigNumber, utils } from 'ethers';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { mkrDelegatedTo } from 'modules/gql/queries/mkrDelegatedTo';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { DelegationHistory, MKRDelegatedToDAIResponse } from '../types';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  try {
    const data = await gqlRequest({
      chainId: networkNameToChainId(network),
      query: mkrDelegatedTo,
      variables: { argAddress: address.toLowerCase() }
    });

    const res: MKRDelegatedToDAIResponse[] = data.mkrDelegatedTo.nodes;

    const delegatedTo = res.reduce((acc, { immediateCaller, lockAmount, blockTimestamp, hash }) => {
      const existing = acc.find(({ address }) => address === immediateCaller) as
        | DelegationHistory
        | undefined;
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
        existing.events.push({ lockAmount, blockTimestamp, hash });
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
          events: [{ lockAmount, blockTimestamp, hash }]
        } as DelegationHistory);
      }

      return acc;
    }, [] as DelegationHistory[]);

    return delegatedTo.sort((prev, next) =>
      utils.parseEther(prev.lockAmount).gt(utils.parseEther(next.lockAmount)) ? -1 : 1
    );
  } catch (e) {
    console.error('Error fetching MKR delegated to address', e.message);
    return [];
  }
}
