import { utils } from 'ethers';
import { SupportedNetworks } from 'lib/constants';
import { DelegationHistory, MKRDelegatedToDAIResponse } from '../types';
import getMaker from 'lib/maker';
import BigNumber from 'bignumber.js';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);

  try {
    const delRes: MKRDelegatedToDAIResponse[] = await maker
      .service('voteDelegate')
      .getMkrDelegatedTo(address);

    const delegatedTox = delRes.reduce((acc, { immediateCaller, lockAmount }) => {
      const existing = acc.find(({ address }) => address === immediateCaller) as
        | MKRDelegatedToDAIResponse
        | undefined;
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount)),
          events: []
        } as DelegationHistory);
      }

      return acc;
    }, [] as DelegationHistory[]);

    return delegatedTox.sort((prev, next) =>
      new BigNumber(prev.lockAmount).isGreaterThan(new BigNumber(next.lockAmount)) ? -1 : 1
    );
  } catch (e) {
    console.error('delegated to error', e.message);
    return [];
  }
}
