import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { DelegateContractInformation } from '../types';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const maker = await getMaker(network);

  const delegates = await maker.service('voteDelegate').getAllDelegates();

  const mkrStaked = await Promise.all(
    delegates.map(async delegate => {
      // Get MKR delegated to each contract
      const mkr = await maker.service('chief').getNumDeposits(delegate.voteDelegate);
      return mkr.toNumber();
    })
  );

  return delegates.map((d, index) => ({
    ...d,
    address: d.delegate,
    voteDelegateAddress: d.voteDelegate,
    mkrDelegated: mkrStaked[index]
  }));
}
