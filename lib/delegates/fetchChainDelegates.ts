import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { DelegateContractInformation } from 'types/delegate';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const maker = await getMaker(network);

  const delegates = await maker.service('voteDelegate').getAllDelegates();

  return delegates.map(d => ({
    ...d,
    address: d.delegate,
    voteDelegateAddress: d.voteDelegate
  }));
}
