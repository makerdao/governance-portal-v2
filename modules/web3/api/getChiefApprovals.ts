import { BigNumber } from 'ethers';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from '../helpers/chain';

export const getChiefApprovals = async (address: string, network?: SupportedNetworks): Promise<BigNumber> => {
  const chainId = networkNameToChainId(network || DEFAULT_NETWORK.network);
  const contracts = getContracts(chainId, undefined, undefined, true);

  return await contracts['chief'].approvals(address);
};
