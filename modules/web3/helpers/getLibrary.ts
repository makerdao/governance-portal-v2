import { providers } from 'ethers';

export function getLibrary(provider: any): providers.Web3Provider {
  const library = new providers.Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : 'any'
  );
  library.pollingInterval = 15000;
  return library;
}
