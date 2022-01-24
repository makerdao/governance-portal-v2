import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { NetworkContextName } from 'modules/web3/constants/networks';

interface ActiveWeb3React extends Web3ReactContextInterface {
  account?: string;
}

export function useActiveWeb3React(): ActiveWeb3React {
  const context = useWeb3React<Web3Provider>() as ActiveWeb3React;
  const interfaceNetworkContext = useWeb3React<Web3Provider>(NetworkContextName) as ActiveWeb3React;

  if (context.active) {
    return context;
  }

  return interfaceNetworkContext;
}
