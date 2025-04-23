import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { formatBaLabsUrl, getBaLabsApiUrl } from '../helpers/getSubgraphUrl';

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
    }
  }

  const { data, error, isLoading } = useQuery<UsdsDaiChartInfo[], Error>({
    queryKey: ['usds-dai-data', url?.toString()],
    queryFn: () => (url ? fetchUsdsDaiData(url) : Promise.resolve([])),
    enabled: !!url,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  return {
    data,
    isLoading,
    error
  };
}
