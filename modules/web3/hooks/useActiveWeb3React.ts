import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { NetworkContextName } from 'modules/web3/constants/networks';

export function useActiveWeb3React(): Web3ReactContextInterface {
  const context = useWeb3React<Web3Provider>();
  const interfaceNetworkContext = useWeb3React<Web3Provider>(NetworkContextName);

  if (context.active) {
    return context;
  }

  return interfaceNetworkContext;
}
