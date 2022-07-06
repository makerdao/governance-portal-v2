export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  GOERLIFORK = 31337
}

export enum GaslessChainId {
  ARBITRUM = 42161,
  ARBITRUMTESTNET = 421611
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  id => typeof id === 'number'
) as SupportedChainId[];
