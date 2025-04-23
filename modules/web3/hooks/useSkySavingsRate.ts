/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useQuery } from '@tanstack/react-query';
import { getBaLabsApiUrl, formatBaLabsUrl } from '../helpers/getSubgraphUrl';
import { useChainId } from 'wagmi';

type SkySavingsRateResponse = {
  data?: string | undefined;
  isLoading: boolean;
  error?: Error | null;
  mutate: () => void;
};

type OverallSkyApiResponse = {
  sky_savings_rate_apy?: string;
};

function transformOverallSkyData(data: OverallSkyApiResponse[]): string {
  let result = '';

  data.forEach((item: OverallSkyApiResponse) => {
    if ('sky_savings_rate_apy' in item) {
      result = item.sky_savings_rate_apy ?? '';
    }
  });

  return result;
}

async function fetchOverallSkyData(url: URL): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data: OverallSkyApiResponse[] = await response.json();
    return transformOverallSkyData(data);
  } catch (error) {
    console.error('Error fetching Overall Sky data:', error);
    throw error;
  }
}

export const useSkySavingsRate = (): SkySavingsRateResponse => {
  const chainId = useChainId();
  const baseUrl = getBaLabsApiUrl(chainId) || '';
  let url: URL | undefined;
  if (baseUrl) {
    const endpoint = `${baseUrl}/overall/`;
    url = formatBaLabsUrl(new URL(endpoint));
  }

  const {
    data,
    error,
    refetch: mutate,
    isLoading
  } = useQuery({
    enabled: Boolean(baseUrl),
    queryKey: ['overall-sky-data', url],
    queryFn: () => (url ? fetchOverallSkyData(url) : Promise.reject('No URL available'))
  });

  return {
    data,
    isLoading,
    error,
    mutate
  };
};
