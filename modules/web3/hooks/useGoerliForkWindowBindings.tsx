import { Wallet } from 'ethers';
import { useContext, useEffect } from 'react';
import { SupportedChainId } from '../constants/chainID';
import { providers } from 'ethers';
import { CustomizedBridge } from '../connections/CustomizedBridge';
import logger from 'lib/logger';
import { Web3ProviderContext } from '../components/Web3Provider';
import { initializeConnector } from '@web3-react/core';
import { EIP1193 } from '@web3-react/eip1193';

export function useGoerliForkWindowBindings(): void {
  // TODO this should only run in non-prod environments
  // Define a window function that changes the account for testing purposes

  const { addConnector } = useContext(Web3ProviderContext);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setAccount = (address: string, key: string) => {
        if (address && key) {
          try {
            const rpcUrl = 'http://127.0.0.1:8545/';
            const provider = new providers.JsonRpcProvider(rpcUrl, SupportedChainId.GOERLIFORK);
            const signer = new Wallet(key, provider);
            const bridge = new CustomizedBridge(signer, provider);
            bridge.setAddress(address);
            (window as any).ethereum = bridge;

            const [web3Injected, web3InjectedHooks] = initializeConnector<EIP1193>(
              actions => new EIP1193({ provider: bridge, actions })
            );

            addConnector([web3Injected, web3InjectedHooks]);
          } catch (err) {
            logger.error(err);
          }
        }
      };
    }
  }, []);
}
