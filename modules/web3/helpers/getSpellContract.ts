import { getEthersContracts } from './getEthersContracts';
import spellAbi from 'modules/contracts/ethers/dsSpell.json';
import { DsSpell } from '../../../types/ethers-contracts';
import { SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';

export const getSpellContract = (address: string, network: SupportedNetworks): DsSpell => {
  const chainId = networkNameToChainId(network);
  const spellContract = getEthersContracts<DsSpell>(address, spellAbi, chainId);

  return spellContract;
};
