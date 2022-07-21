import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchDelegate } from 'modules/delegates/api/fetchDelegates';
import { AddressApiResponse } from '../types/addressApiResponse';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getVoteProxyAddresses } from 'modules/app/helpers/getVoteProxyAddresses';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getAddressDetailCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';

export async function getAddressInfo(
  address: string,
  network: SupportedNetworks
): Promise<AddressApiResponse> {
  const cacheKey = getAddressDetailCacheKey(address);
  const cachedAddressInfo = await cacheGet(cacheKey, network);
  if (cachedAddressInfo) {
    return JSON.parse(cachedAddressInfo);
  }

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
    voteDelegateAdress: voteDelegateAdress !== ZERO_ADDRESS ? voteDelegateAdress : undefined
  };

  cacheSet(cacheKey, JSON.stringify(response), network, TEN_MINUTES_IN_MS);

  return response;
}
