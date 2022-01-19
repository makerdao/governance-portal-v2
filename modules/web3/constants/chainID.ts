export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  TESTNET = 999,
  GOERLIFORK = 31337
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  id => typeof id === 'number'
) as SupportedChainId[];
