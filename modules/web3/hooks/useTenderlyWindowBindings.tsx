/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Wallet } from 'ethers';
import { useContext, useEffect } from 'react';
import { SupportedChainId } from '../constants/chainID';
import { providers } from 'ethers';
import { CustomizedBridge } from '../connections/CustomizedBridge';
import logger from 'lib/logger';
import { Web3ProviderContext } from '../components/Web3Provider';
import { initializeConnector } from '@web3-react/core';
import { EIP1193 } from '@web3-react/eip1193';
import { config } from 'lib/config';

export function useTenderlyWindowBindings(): void {
  // Define a window function that changes the account for testing purposes

  const { addConnector } = useContext(Web3ProviderContext);

  useEffect(() => {
    if (typeof window !== 'undefined' && config.USE_MOCK_WALLET && process.env.NODE_ENV !== 'production') {
      (window as any).setAccount = (address: string, key: string) => {
        if (address && key) {
          try {
            const rpcUrl = `https://virtual.mainnet.rpc.tenderly.co/${config.TENDERLY_RPC_KEY}`;
            const provider = new providers.JsonRpcProvider(rpcUrl, SupportedChainId.TENDERLY);
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
