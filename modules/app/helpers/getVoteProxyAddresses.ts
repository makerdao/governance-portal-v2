import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteProxy.json';
import { Contract } from '@ethersproject/contracts';
import { VoteProxy } from '../../../types/ethers-contracts/VoteProxy';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';

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

  const [proxyAddressCold, proxyAddressHot] = await Promise.all([
    voteProxyFactory.coldMap(account),
    voteProxyFactory.hotMap(account)
  ]);

  if (proxyAddressCold !== ZERO_ADDRESS) {
    voteProxyAddress = proxyAddressCold;
    coldAddress = account;
  } else if (proxyAddressHot !== ZERO_ADDRESS) {
    voteProxyAddress = proxyAddressHot;
    hotAddress = account;
  }

  if (voteProxyAddress) {
    const vpContract = getEthersContracts<VoteProxy>(voteProxyAddress, abi, networkNameToChainId(network));
    hotAddress = hotAddress ?? (await vpContract.hot());
    coldAddress = coldAddress ?? (await vpContract.cold());
    hasProxy = true;
  }

  return { hotAddress, coldAddress, voteProxyAddress, hasProxy };
};
