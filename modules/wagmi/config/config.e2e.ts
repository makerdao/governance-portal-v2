import { http } from 'viem';
import { createConfig, createStorage, noopStorage } from 'wagmi';
import { getTestTenderlyChain } from './testTenderlyChain';
import { mock } from 'wagmi/connectors';
import { TEST_ACCOUNTS } from '../../../playwright/shared';

const tenderlyMainnet = getTestTenderlyChain();

export const mockWagmiConfig = createConfig({
  chains: [tenderlyMainnet],
  connectors: [
    mock({
      accounts: [TEST_ACCOUNTS.normal.address as `0x${string}`],
      features: {
        reconnect: true
      }
    })
  ],
  transports: {
    [tenderlyMainnet.id]: http()
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : noopStorage,
    key: 'wagmi-mock'
  })
});
