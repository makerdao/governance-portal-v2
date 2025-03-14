import {
  arbitrumPublicClient,
  arbitrumTestnetPublicClient,
  mainnetPublicClient,
  tenderly,
  tenderlyPublicClient
} from 'modules/wagmi/config/config.default';
import { mockPublicClient } from 'modules/wagmi/config/config.e2e';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

export const getPublicClient = (chainId: number) => {
  const useMockWallet =
    process.env.NEXT_PUBLIC_USE_MOCK_WALLET === 'true' && process.env.NODE_ENV !== 'production';

  if (useMockWallet) return mockPublicClient;

  return chainId === tenderly.id
    ? tenderlyPublicClient
    : chainId === arbitrumSepolia.id
    ? arbitrumTestnetPublicClient
    : chainId === arbitrum.id
    ? arbitrumPublicClient
    : mainnetPublicClient;
};

// We only get this gasless public client from any of the 2 supported networks in the app: Mainnet or Tenderly
export const getGaslessPublicClient = (chainId: number) => {
  return chainId === tenderly.id ? arbitrumTestnetPublicClient : arbitrumPublicClient;
};
