import { SupportedChainId } from '../constants/chainID';
import { URL_BA_LABS_API_MAINNET, URL_BA_LABS_API_TENDERLY } from '../constants/networks';

export function getBaLabsApiUrl(chainId: number | undefined): string | null {
  if (chainId === undefined) return null;
  switch (chainId) {
    case SupportedChainId.TENDERLY:
      return URL_BA_LABS_API_TENDERLY;
    default:
      return URL_BA_LABS_API_MAINNET;
  }
}

export function formatBaLabsUrl(url: URL) {
  url.searchParams.append('format', 'json');

  return url;
}
