import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';

export default function useActiveWeb3React() {
  const context = useWeb3React();
  // TODO can have different contexts for different networks
  const interfaceNetworkContext = useWeb3React<Web3Provider>(undefined);

  if (context.active) {
    return context;
  }

  return interfaceNetworkContext;
}
