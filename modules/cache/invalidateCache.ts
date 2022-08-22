import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';

export const invalidateCache = async (cacheKey: string, password: string, network?: SupportedNetworks) => {
  await fetchJson(`/api/cache/invalidate?network=${network}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cacheKey,
      password
    })
  });
};
