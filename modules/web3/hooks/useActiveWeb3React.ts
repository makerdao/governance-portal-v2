import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { chainIdToNetworkName } from '../helpers/chain';

// TODO type this

export function useActiveWeb3React(): any {
  const context = useWeb3React<Web3Provider>();

  const network = chainIdToNetworkName(context.chainId);

  return {
    ...context,
    network
  };
}
