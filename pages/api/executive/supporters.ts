import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from 'lib/maker';
import { getConnectedMakerObj } from 'lib/api/utils';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getConnectedMakerObj(network);
  const [allSupporters, delegatesResponse] = await Promise.all([
    maker.service('chief').getVoteTally(),
    fetchDelegates(network)
  ]);

  // map delegate addresses to name
  const delegates = delegatesResponse.delegates.reduce((acc, cur) => {
    const formattedName = !cur.name || cur.name === '' ? 'Shadow Delegate' : cur.name;
    acc[cur.voteDelegateAddress] = formattedName;
    return acc;
  }, {});

  // handle percent and check address for delegate name
  Object.keys(allSupporters).forEach(spell => {
    allSupporters[spell].forEach(supporter => {
      if (supporter.percent === 'NaN') supporter.percent = '0.00';
      if (delegates[supporter.address]) supporter.name = delegates[supporter.address];
    });
  });

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(allSupporters);
});
