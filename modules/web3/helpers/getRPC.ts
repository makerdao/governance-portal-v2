import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO } from '../constants/networks';

export function getRPCFromChainID(chainId: SupportedChainId, provider?: string): string {
  const chain = CHAIN_INFO[chainId];

  const defaultProvider = chain.defaultRPC;

  return provider ? chain.rpcs[provider] : chain.rpcs[defaultProvider];
}
