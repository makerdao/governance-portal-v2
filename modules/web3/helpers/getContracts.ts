import { ethers, Signer } from 'ethers';
import { getGoerliSdk, getMainnetSdk, GoerliSdk, MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

export type EthSdk = MainnetSdk | GoerliSdk;

type Sdks = {
  mainnet: (signer: Signer) => MainnetSdk;
  goerli: (signer: Signer) => GoerliSdk;
};

const sdks: Sdks = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

// this name doesn't feel right, maybe getSdk? or getContractLibrary?
export const getContracts = (
  chainId?: number,
  library?: Web3Provider,
  account?: string | undefined | null
): EthSdk => {
  const network = chainId ? CHAIN_INFO[chainId].network : SupportedNetworks.MAINNET;
  const provider = ethers.getDefaultProvider(network);

  /* 
  A read-only signer, when an API requires a Signer as a parameter, but it is known only read-only operations will be carried.
  https://docs.ethers.io/v5/api/signer/#VoidSigner 

  eth-sdk only accepts a signer for now, but there's an issue for it
  https://github.com/dethcrypto/eth-sdk/issues/63
  */
  const signer =
    account && library ? library.getSigner(account) : new ethers.VoidSigner(ZERO_ADDRESS, provider);

  return sdks[network](signer);
};
