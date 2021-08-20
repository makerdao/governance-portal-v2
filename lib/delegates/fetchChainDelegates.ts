import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { DelegateContractInformation } from 'types/delegate';

export async function fetchChainDelegates(
  network: SupportedNetworks
): Promise<DelegateContractInformation[]> {
  const maker = await getMaker(network);

  const delegates = await maker.service('voteDelegate').getAllDelegates();
  // console.log('delegates', delegates);
  // const addresses = [
  //   '0x883b94bbd31902c79ab2c2daf89d439c94232319',
  //   '0x55e8a7f72a15cea2377872f337b4c7b26240f744',
  //   '0x7a74fb6bd364b9b5ef69605a3d28327da8087aa0'
  // ];
  const voteHistory = await maker
    .service('voteDelegate')
    .getDelegatesVotingHistoryByAddresses(delegates.map(d => d.voteDelegate));

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
    mkrDelegated: mkrStaked[index],
    voteHistory: voteHistory.filter(vh => vh.voter === d.voteDelegate)
  }));
}
