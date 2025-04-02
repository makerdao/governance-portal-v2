import { createPublicClient, http } from 'viem';
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
    // Passing undefined for the RPC URL as it will use the one defined in the Tenderly chain object
    [tenderlyMainnet.id]: http(undefined, { batch: { wait: 500 } })
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : noopStorage,
    key: 'wagmi-mock'
  })
});

export const mockPublicClient = createPublicClient({
  chain: tenderlyMainnet,
  transport: http(undefined, { batch: { wait: 500 } }),
  key: 'mock-public-client',
  name: 'Mock public client'
});
