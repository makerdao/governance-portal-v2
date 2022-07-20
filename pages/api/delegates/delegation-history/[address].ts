import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'modules/web3/helpers/networks';

import { fetchDelegationEventsByAddresses } from 'modules/delegates/api/fetchDelegationEventsByAddresses';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressDelegationHistoryCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
  const address = req.query.address as string;

  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const cacheKey = getAddressDelegationHistoryCacheKey(address);
  const cachedResponse = await cacheGet(cacheKey, network);

  if (cachedResponse) {
    return res.status(200).json(JSON.parse(cachedResponse));
  }

  const data = await fetchDelegationEventsByAddresses([address], network);
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');

  cacheSet(cacheKey, JSON.stringify(data), network, TEN_MINUTES_IN_MS);
  res.status(200).json(data);
});
