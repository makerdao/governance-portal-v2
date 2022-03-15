import { useWeb3React } from '@web3-react/core';
import { Wallet } from 'ethers';
import { useEffect } from 'react';
import { SupportedChainId } from '../constants/chainID';
import { JsonRpcProvider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { CustomizedBridge } from '../connectors/CustomizedBridge';

export function useGoerliForkWindowBindings(): void {
  const context = useWeb3React();
  // Define a window function that changes the account for testing purposes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setAccount = (address: string, key: string) => {
        if (address && key) {
          const rpcUrl = 'http://localhost:8545';
          const provider = new JsonRpcProvider(rpcUrl, SupportedChainId.GOERLIFORK);
          const signer = new Wallet(key, provider);

          const bridge = new CustomizedBridge(signer, provider);
          bridge.setAddress(address);
          (window as any).ethereum = bridge;

          context.activate(
            new InjectedConnector({
              supportedChainIds: [SupportedChainId.GOERLIFORK]
            }),
            err => {
              console.log('error', err);
            }
          );
        }
      };
    }
  }, []);
}
