import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React, Web3ContextType } from '@web3-react/core';
import logger from 'lib/logger';
import { SupportedNetworks } from '../constants/networks';
import { chainIdToNetworkName } from '../helpers/chain';

export function useWeb3():  Web3ContextType<Web3Provider>  & { network: SupportedNetworks } {
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
