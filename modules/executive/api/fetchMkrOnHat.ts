import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { BigNumber } from 'ethers';

export type MkrOnHatResponse = {
  hat: string;
  mkrOnHat: BigNumber;
};

export async function fetchMkrOnHat(network?: SupportedNetworks): Promise<MkrOnHatResponse> {
  const chainId = network ? networkNameToChainId(network) : networkNameToChainId(SupportedNetworks.MAINNET);
  const contracts = getContracts(chainId, undefined, undefined, true);
  const hat = await contracts.chief.hat();
  const mkrOnHat = await getChiefApprovals(hat, network);

  return { hat, mkrOnHat };
}
