import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { fetchExecutiveVoteTally } from 'modules/executive/api/fetchExecutiveVoteTally';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const chief = getContracts(networkNameToChainId(network)).chief;

  const [allSupporters, delegatesResponse] = await Promise.all([
    fetchExecutiveVoteTally(chief),
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
