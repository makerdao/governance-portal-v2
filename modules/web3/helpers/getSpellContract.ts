import { DssSpell } from '.dethcrypto/eth-sdk-client/esm/types';
import { SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from './chain';
import { getContracts } from './getContracts';

export const getSpellContract = (address: string, network: SupportedNetworks): DssSpell => {
  const chainId = networkNameToChainId(network);
  const { dssSpell } = getContracts(chainId, undefined, undefined, true);

  // Returns a new instance of the contract attached to this address
  return dssSpell.attach(address);
};
