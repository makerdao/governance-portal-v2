import { ethers } from 'ethers';
import { getGoerliSdk, getMainnetSdk } from '@dethcrypto/eth-sdk-client';
import { ZERO_ADDRESS } from 'modules/app/constants';
import { CHAIN_INFO, SupportedNetworks } from '../web3.constants';
import { EthSdkConfig } from '@dethcrypto/eth-sdk';

const sdks = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

// this name doesn't feel right, maybe getSdk? or getContractLibrary?
export const getContract = (chainId?: number): any => {
  const network = chainId ? CHAIN_INFO[chainId].network : SupportedNetworks.MAINNET;
  const provider = ethers.getDefaultProvider(network);
  const account = null; // Fake not having it to test read-only

  /* 
  A read-only signer, when an API requires a Signer as a parameter, but it is known only read-only operations will be carried.
  https://docs.ethers.io/v5/api/signer/#VoidSigner 

  eth-sdk only accepts a signer for now, but there's an issue for it
  https://github.com/dethcrypto/eth-sdk/issues/63
  */
  const library = account ?? new ethers.VoidSigner(ZERO_ADDRESS, provider);

  return sdks[network](library);
};
