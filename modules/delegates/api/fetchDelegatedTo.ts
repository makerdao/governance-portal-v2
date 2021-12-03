import { utils } from 'ethers';
import { SupportedNetworks } from 'lib/constants';
import { DelegationHistory, MKRLockedDelegateAPIResponse } from '../types';
import getMaker from 'lib/maker';

export async function fetchDelegatedTo(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);
  let delegatedTox = [];

  try {
    const delRes: MKRLockedDelegateAPIResponse[] = await maker
      .service('voteDelegate')
      .getMkrDelegatedTo(address);

    delegatedTox = delRes.reduce((acc, { fromAddress, immediateCaller, lockAmount, blockTimestamp }) => {
      const existing = acc.find(({ address }) => address === immediateCaller);
      if (existing) {
        existing.lockAmount = utils.formatEther(
          utils.parseEther(existing.lockAmount).add(utils.parseEther(lockAmount))
        );
      } else {
        acc.push({
          address: immediateCaller,
          lockAmount: utils.formatEther(utils.parseEther(lockAmount))
        });
      }

      return acc;
    }, []);
  } catch (e) {
    console.error('delegated to error');
  }

  return delegatedTox; //filter 0 here not in the api
}
