import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

export function useActiveWeb3React(): Web3ReactContextInterface {
  const context = useWeb3React<Web3Provider>();

  // TODO can have different contexts for different networks
  // pass network name to use
  const interfaceNetworkContext = useWeb3React<Web3Provider>(undefined);

  if (context.active) {
    return context;
  }

  return interfaceNetworkContext;
}
