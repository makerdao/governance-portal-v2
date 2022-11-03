import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';

export const getCacheInfo = async (network?: SupportedNetworks) => {
  const info = await fetchJson(`/api/cache/info?network=${network}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return info;
};
