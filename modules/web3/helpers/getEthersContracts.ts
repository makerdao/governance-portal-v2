import { Contract, getDefaultProvider } from 'ethers';
import { CHAIN_INFO, SupportedNetworks } from '../web3.constants';
import { JsonRpcSigner } from '@ethersproject/providers';

export const getEthersContracts = (
  address: string, // deployed contract address
  abi: any,
  chainId?: number,
  signer?: JsonRpcSigner | null //connected wallet/address signer
): Contract => {
  const network = chainId ? CHAIN_INFO[chainId].network : SupportedNetworks.MAINNET;
  const provider = getDefaultProvider(network);

  const signerOrProvider = signer ?? provider;

  return new Contract(address, abi, signerOrProvider);
};
