import {
  arbitrumPublicClient,
  arbitrumTestnetPublicClient,
  mainnetPublicClient,
  tenderly,
  tenderlyPublicClient
} from 'modules/wagmi/config/config.default';
import { arbitrum, arbitrumSepolia } from 'viem/chains';

export const getPublicClient = (chainId: number) => {
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
