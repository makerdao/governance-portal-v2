import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import logger from 'lib/logger';
import { chainIdToNetworkName } from '../helpers/chain';

// TODO type this

export function useWeb3(): any {
  const context = useWeb3React<Web3Provider>();

  let network;
  try {
    network = chainIdToNetworkName(context.chainId);
  } catch (err) {
    logger.warn('connected to unsupported network');
  }

  return {
    ...context,
    network
  };
}
