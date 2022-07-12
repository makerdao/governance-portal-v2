import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchDelegate } from 'modules/delegates/api/fetchDelegates';
import { AddressApiResponse } from '../types/addressApiResponse';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';

export async function getAddressInfo(
  address: string,
  network: SupportedNetworks
): Promise<AddressApiResponse> {
  const contracts = getContracts(networkNameToChainId(network), undefined, undefined, true);

  const voteProxyAddress = await getVoteProxyAddresses(contracts.voteProxyFactory, address, network);

  const delegate = await fetchDelegate(address, network);

  const voteDelegateAdress = await contracts.voteDelegateFactory.delegates(address);

  const response: AddressApiResponse = {
    isDelegate: !!delegate,
    isProxyContract: !!voteProxyAddress.hotAddress,
    voteProxyInfo: voteProxyAddress,
    delegateInfo: delegate,
    address,
    voteDelegateAdress
  };

  return response;
}
