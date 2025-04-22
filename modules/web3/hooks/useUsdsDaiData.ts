import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { SupportedChainId } from '../constants/chainID';

// Constants for API URLs
export const URL_BA_LABS_API_MAINNET = 'https://info-sky.blockanalitica.com/api/v1';
export const URL_BA_LABS_API_TENDERLY = 'https://sky-tenderly.blockanalitica.com/api/v1';

/**
 * Returns the appropriate Block Analitica API URL based on the chain ID.
 * @param chainId The chain ID.
 * @returns The base API URL string or null if chainId is undefined.
 */
export function getBaLabsApiUrl(chainId: number | undefined): string | null {
  if (chainId === undefined) return null;
  switch (chainId) {
    case SupportedChainId.TENDERLY:
      return URL_BA_LABS_API_TENDERLY;
    // Add other specific chain cases if needed
    // case mainnet.id: // Example for mainnet
    //   return URL_BA_LABS_API_MAINNET;
    default:
      // Default to mainnet URL for other chains (adjust if needed)
      return URL_BA_LABS_API_MAINNET;
  }
}

/**
 * @param url The URL object to format.
 * @returns The formatted URL object.
 */
export function formatBaLabsUrl(url: URL): URL {
  return url;
}

// Types for the API response and transformed data
type UsdsDaiApiResponse = {
  datetime: string;
  total_dai: string;
  total_usds: string;
  surplus_buffer: string;
  total: string;
};

type UsdsDaiChartInfo = {
  blockTimestamp: number;
  totalDai: string;
  totalUsds: string;
  surplusBuffer: string;
  total: string;
};

/**
 * Transforms the raw API response data into the desired chart format.
 * @param results Array of raw API response objects.
 * @returns Array of transformed chart data objects.
 */
function transformBaLabsData(results: UsdsDaiApiResponse[]): UsdsDaiChartInfo[] {
  const parsed = results.map((item: UsdsDaiApiResponse) => {
    return {
      blockTimestamp: new Date(item?.datetime).getTime() / 1000,
      totalDai: item.total_dai,
      totalUsds: item.total_usds,
      surplusBuffer: item.surplus_buffer,
      total: item.total
    };
  });
  return parsed;
}

/**
 * Fetches the USDS/DAI historic data from the Block Analitica API.
 * @param url The URL object for the API endpoint.
 * @returns A promise that resolves to an array of transformed chart data.
 */
async function fetchUsdsDaiData(url: URL): Promise<UsdsDaiChartInfo[]> {
  try {
    const response = await fetch(url.toString(), {
      // Ensure URL is string for fetch
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Throw an error with status for React Query to handle
      throw new Error(`Network response was not ok: ${response.statusText} (status: ${response.status})`);
    }

    const data: { results: UsdsDaiApiResponse[] } = await response.json();

    const result = transformBaLabsData(data?.results || []);

    return result;
  } catch (error) {
    console.error('Error fetching BaLabs data:', error);
    throw error;
  }
}

/**
 * Hook to fetch historic overall USDS/DAI data from the Block Analitica API.
 *
 * @returns An object containing the fetched data, loading state, error state,
 *          refetch function, and data source information.
 */
export function useUsdsDaiData(): { data?: UsdsDaiChartInfo[]; isLoading: boolean; error: Error | null } {
  const chainId = useChainId();
  const baseUrl = getBaLabsApiUrl(chainId); // Can return null
  let url: URL | undefined;

  if (baseUrl) {
    try {
      const endpoint = `${baseUrl}/overall/historic/`;
      url = formatBaLabsUrl(new URL(endpoint));
    } catch (error) {
      console.error('Error constructing Block Analitica API URL:', error);
      // url remains undefined, React Query will not fetch
    }
  }

  const {
    data,
    error,
    isLoading // Use isLoading directly from useQuery
  } = useQuery<UsdsDaiChartInfo[], Error>({
    // queryKey needs to be stable and serializable. Use the URL string or parts of it.
    // Using the full URL string ensures uniqueness per endpoint and chain.
    // Handle the case where url might be undefined initially.
    queryKey: ['usds-dai-data', url?.toString()],
    // queryFn receives the context, including queryKey. Fetch only if url is defined.
    queryFn: () => (url ? fetchUsdsDaiData(url) : Promise.resolve([])), // Return empty array if no URL
    // Enable the query only when the URL is successfully constructed.
    enabled: !!url,
    // Optional: Configure stale time, cache time, refetch intervals, etc.
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  return {
    /** The fetched historic USDS/DAI data array, or undefined if loading, not enabled, or an error occurred. */
    data,
    /** Boolean indicating if the query is currently fetching for the first time (no data yet). */
    isLoading: isLoading, // Reflects initial loading state
    /** The error object if an error occurred, otherwise null. */
    error: error || null // Return null if no error
  };
}
