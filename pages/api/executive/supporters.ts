import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { fetchExecutiveVoteTally } from 'modules/executive/api/fetchExecutiveVoteTally';
import { cacheGet, cacheSet } from 'lib/cache';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const chief = getContracts(networkNameToChainId(network), undefined, undefined, true).chief;

  const cacheKey = `executive-vote-tally-${chief.address}`;

  const cached = await cacheGet(cacheKey, network);

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (cached) {
    res.status(200).json(cached);
    return;
  }

  const allSupporters = await fetchExecutiveVoteTally(chief);

  // handle percent and check address
  Object.keys(allSupporters).forEach(spell => {
    allSupporters[spell].forEach(supporter => {
      if (supporter.percent === 'NaN') supporter.percent = '0';
    });
  });

  const tenMinutesInMs = 10 * 60 * 1000;
  cacheSet(cacheKey, JSON.stringify(allSupporters), network, tenMinutesInMs);
  res.status(200).json(allSupporters);
});
