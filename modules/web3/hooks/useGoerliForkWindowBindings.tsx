import { Wallet } from 'ethers';
import { useEffect } from 'react';
import { SupportedChainId } from '../constants/chainID';
import { providers } from 'ethers';
import { injectedConnection } from 'modules/web3/connections';
import { CustomizedBridge } from '../connections/CustomizedBridge';
import logger from 'lib/logger';

export function useGoerliForkWindowBindings(): void {
  // TODO this should only run in non-prod environments
  // Define a window function that changes the account for testing purposes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).setAccount = (address: string, key: string) => {
        if (address && key) {
          try {
            const rpcUrl = 'http://localhost:8545';
            const provider = new providers.JsonRpcProvider(rpcUrl, SupportedChainId.GOERLIFORK);
            const signer = new Wallet(key, provider);
            const bridge = new CustomizedBridge(signer, provider);
            bridge.setAddress(address);
            (window as any).ethereum = bridge;
            injectedConnection.connector.activate();
          } catch (err) {
            logger.error(err);
          }
        }
      };
    }
  }, []);
}
