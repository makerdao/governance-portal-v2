import { utils } from 'ethers';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import { DelegationHistory, MKRDelegatedToDAIResponse } from '../types';
import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);

  try {
    const res: MKRDelegatedToDAIResponse[] = await maker.service('voteDelegate').getMkrDelegatedTo(address);

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
      new BigNumber(prev.lockAmount).isGreaterThan(new BigNumber(next.lockAmount)) ? -1 : 1
    );
  } catch (e) {
    console.error('Error fetching MKR delegated to address', e.message);
    return [];
  }
}
