import { Contract } from 'ethers';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteProxy.json';
import { VoteProxy } from '../../../types/ethers-contracts/VoteProxy';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { ONE_HOUR_IN_MS } from '../constants/time';

export type VoteProxyAddresses = {
  hotAddress?: string;
  coldAddress?: string;
  voteProxyAddress?: string;
  hasProxy: boolean;
};

export const getVoteProxyAddresses = async (
  voteProxyFactory: Contract,
  account: string,
  network: SupportedNetworks
): Promise<VoteProxyAddresses> => {
  let hotAddress,
    coldAddress,
    voteProxyAddress,
    hasProxy = false;

  const cacheKey = `proxy-info-${account}`;

  const cachedProxyInfo = await cacheGet(cacheKey, network);
  if (cachedProxyInfo) {
    return JSON.parse(cachedProxyInfo);
  }

  // first check if account is a proxy contract
  try {
    // assume account is a proxy contract
    const vpContract = getEthersContracts<VoteProxy>(
      account,
      abi,
      networkNameToChainId(network),
      undefined,
      undefined,
      true
    );

    // this will fail if vpContract is not an instance of vote proxy
    const [proxyAddressCold, proxyAddressHot] = await Promise.all([vpContract.cold(), vpContract.hot()]);

    // if the calls above didn't fail, account is a proxy contract, so set values
    hotAddress = proxyAddressHot;
    coldAddress = proxyAddressCold;
    voteProxyAddress = account;
    hasProxy = true;
  } catch (err) {
    // if we're here, account is not a proxy contract
    // but no need to throw an error
  }

  // if account is not a proxy, check if it is a hot or cold address
  if (!hasProxy) {
    const [proxyAddressCold, proxyAddressHot] = await Promise.all([
      voteProxyFactory.coldMap(account),
      voteProxyFactory.hotMap(account)
    ]);

    // if account belongs to a hot or cold map, get proxy contract address
    if (proxyAddressCold !== ZERO_ADDRESS) {
      voteProxyAddress = proxyAddressCold;
      coldAddress = account;
    } else if (proxyAddressHot !== ZERO_ADDRESS) {
      voteProxyAddress = proxyAddressHot;
      hotAddress = account;
    }

    // found proxy contract, now determine hot and cold addresses
    if (voteProxyAddress) {
      const vpContract = getEthersContracts(
        voteProxyAddress,
        abi,
        networkNameToChainId(network),
        undefined,
        undefined,
        true
      );
      hotAddress = hotAddress ?? (await vpContract.hot());
      coldAddress = coldAddress ?? (await vpContract.cold());
      hasProxy = true;
    }
  }

  const proxyInfo = { hotAddress, coldAddress, voteProxyAddress, hasProxy };

  // cache for 60 mins
  cacheSet(cacheKey, JSON.stringify(proxyInfo), network, ONE_HOUR_IN_MS);

  // it's been a long journey through the proxy jungles, let's go home
  return proxyInfo;
};
