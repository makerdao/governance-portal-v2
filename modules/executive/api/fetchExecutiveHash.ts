import { SupportedNetworks } from 'lib/constants';
import { getNetwork } from 'lib/maker';
import { networkToRpc } from 'lib/maker/network';
import Web3 from 'web3';
import abi from './abis/spell.json';
export async function fetchExecutiveHash(
  contractAddress: string,
  network?: SupportedNetworks
): Promise<string> {
  const currentNetwork = network ? network : getNetwork();

  const web3 = new Web3(new Web3.providers.HttpProvider(networkToRpc(currentNetwork, 'infura')));

  const contract = new web3.eth.Contract(abi as any, contractAddress);

  try {
    const description = await contract.methods.description().call();

    const hash = description.substr(description.indexOf('0x'), description.length);
    return hash;
  } catch(e) {
    return '';
  }
  
}
