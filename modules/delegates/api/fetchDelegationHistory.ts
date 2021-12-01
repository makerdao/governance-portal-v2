import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { format, parse } from 'date-fns';
import { SupportedNetworks } from 'lib/constants';
import { DelegationHistory, MKRLockedDelegateAPIResponse } from '../types';
import getMaker from 'lib/maker';

export async function fetchDelegationHistory(
  address: string,
  network: SupportedNetworks
): Promise<DelegationHistory[]> {
  const maker = await getMaker(network);
  const addressData: MKRLockedDelegateAPIResponse[] = await maker
    .service('voteDelegate')
    .getMkrLockedDelegate(address);

  const delegatorsR = addressData.reduce((acc, { fromAddress, lockAmount }) => {
    const currSum = acc[fromAddress]?.lockAmount
      ? utils.parseEther(acc[fromAddress]?.lockAmount)
      : utils.parseEther('0');

    acc[fromAddress] = { lockAmount: utils.formatEther(currSum.add(utils.parseEther(lockAmount))) };
    return acc;
  }, {});

  //TODO do this in the reducer
  const delegators: DelegationHistory[] = [];
  for (const x in delegatorsR) {
    delegators.push({ address: x, ...delegatorsR[x] });
  }

  return delegators.sort((a, b) => (a.lockAmount > b.lockAmount ? -1 : 1));
}
