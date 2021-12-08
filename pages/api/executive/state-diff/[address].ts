import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { fetchSimulationSpellDiffs } from 'modules/executive/api/fetchSimulationSpellDiffs';

import { SupportedNetworks } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO rename this simulate-transaction and it should only be used for that
  const spellAddress2: string = req.query.address as string;

  invariant(spellAddress2 && ethers.utils.isAddress(spellAddress2), 'valid spell address required');

  invariant(
    !req.query.network || req.query.network === SupportedNetworks.MAINNET,
    `unsupported network ${req.query.network}`
  );

  const diffs = await fetchSimulationSpellDiffs();

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(diffs);
});
