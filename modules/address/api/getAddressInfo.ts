import { SupportedNetworks } from 'modules/web3/web3.constants';
import getMaker from 'lib/maker';
import { fetchDelegate } from 'modules/delegates/api/fetchDelegates';
import { AddressApiResponse } from '../types/addressApiResponse';
import voteProxyFactoryAbi from 'lib/abis/voteProxyAbi.json';

export async function getAddressInfo(
  address: string,
  network: SupportedNetworks
): Promise<AddressApiResponse> {
  const maker = await getMaker(network);
  const voteProxyContract = maker
    .service('smartContract')
    .getContractByAddressAndAbi(address, voteProxyFactoryAbi);

  // TODO: should we check cold for history?
  let hot;
  let cold;
  let voteProxyAddress;
  try {
    hot = await voteProxyContract.hot();
    cold = await voteProxyContract.cold();
    voteProxyAddress = address;
  } catch (err) {
    // console.log(err);
  }

  const voteProxyInfo =
    hot && cold && voteProxyAddress
      ? {
          voteProxyAddress,
          hot,
          cold
        }
      : undefined;

  const delegate = await fetchDelegate(address, network);

  const response: AddressApiResponse = {
    isDelegate: !!delegate,
    isProxyContract: !!hot,
    voteProxyInfo,
    delegateInfo: delegate,
    address
  };

  return response;
}
