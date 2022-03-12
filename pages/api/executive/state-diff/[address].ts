import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchSimulationSpellDiffs } from 'modules/executive/api/fetchSimulationSpellDiff';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  const nextCastTime: string = req.query.nextCastTime as string;
  const network: SupportedNetworks = req.query.network as SupportedNetworks;

  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  invariant(
    !req.query.network || req.query.network === SupportedNetworks.MAINNET,
    `unsupported network ${req.query.network}`
  );

  const diffs = await fetchSimulationSpellDiffs(spellAddress, nextCastTime, network);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(diffs);
});
