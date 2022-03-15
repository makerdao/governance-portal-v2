import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { analyzeSpell } from 'modules/executive/api/analyzeSpell';
// In memory result cache
const results = {};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  let analysis;

  if (!results[network]) {
    results[network] = {};
  }

  if (results[network][spellAddress]) {
    analysis = results[network][spellAddress];
  } else {
    analysis = await analyzeSpell(spellAddress, network);
    if (analysis.hasBeenCast) {
      results[network][spellAddress] = analysis;
    }
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(analysis);
});
