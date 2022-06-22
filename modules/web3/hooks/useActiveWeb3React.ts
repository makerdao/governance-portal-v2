import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { NetworkContextName, SupportedNetworks } from 'modules/web3/constants/networks';
import { chainIdToNetworkName } from '../helpers/chain';

interface ActiveWeb3React extends Web3ReactContextInterface {
  account?: string;
  network: SupportedNetworks;
}

export function useActiveWeb3React(): ActiveWeb3React {
  const context = useWeb3React<Web3Provider>() as ActiveWeb3React;
  const interfaceNetworkContext = useWeb3React<Web3Provider>(NetworkContextName) as ActiveWeb3React;
  console.log({ context, interfaceNetworkContext });

  const network = chainIdToNetworkName(context.active ? context.chainId : interfaceNetworkContext.chainId);

  if (context.active) {
    return {
      ...context,
      network
    };
  }

  return {
    ...interfaceNetworkContext,
    network
  };
}
