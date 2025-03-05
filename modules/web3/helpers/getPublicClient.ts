import { mainnetPublicClient, tenderly, tenderlyPublicClient } from 'modules/wagmi/config/config.default';

export const getPublicClient = (chainId: number) => {
  return chainId === tenderly.id ? tenderlyPublicClient : mainnetPublicClient;
};
