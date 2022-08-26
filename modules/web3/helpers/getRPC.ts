import { SupportedChainId, GaslessChainId } from 'modules/web3/constants/chainID';
import { CHAIN_INFO, GASLESS_CHAIN_INFO } from 'modules/web3/constants/networks';

export function getRPCFromChainID(chainId: SupportedChainId | GaslessChainId, provider?: string): string {
  const chain = { ...CHAIN_INFO, ...GASLESS_CHAIN_INFO }[chainId];

  const defaultProvider = chain.defaultRpc;

  return provider ? chain.rpcs[provider] : chain.rpcs[defaultProvider];
}
