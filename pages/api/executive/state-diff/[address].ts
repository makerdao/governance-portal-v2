import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { config } from 'lib/config';
import { ETH_TX_STATE_DIFF_ENDPOINT, SupportedNetworks } from 'modules/web3/constants/networks';
import { getTrace } from 'modules/web3/helpers/getTrace';
import withApiHandler from 'modules/app/api/withApiHandler';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { getDefaultProvider } from 'modules/web3/helpers/getDefaultProvider';
import { fetchSimulationSpellDiffs } from 'modules/executive/api/fetchSimulationSpellDiff';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;

  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  invariant(
    !req.query.network || req.query.network === SupportedNetworks.MAINNET,
    `unsupported network ${req.query.network}`
  );

  const diffs = await fetchSimulationSpellDiffs(spellAddress);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(diffs);
});
