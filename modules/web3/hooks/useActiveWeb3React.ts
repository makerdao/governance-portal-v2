import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import logger from 'lib/logger';
import { chainIdToNetworkName } from '../helpers/chain';

// TODO type this
// TODO separate network from this hook

export function useActiveWeb3React(): any {
  const context = useWeb3React<Web3Provider>();

  console.log({ context });

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
