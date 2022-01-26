import { getEthersContracts } from './getEthersContracts';
import spellAbi from 'modules/contracts/ethers/dsSpell.json';
import { SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

export const getSpellContract = (address: string, network: SupportedNetworks): any => {
  const chainId = networkNameToChainId(network);
  const spellContract = getEthersContracts(address, spellAbi, chainId);

  return spellContract;
};
