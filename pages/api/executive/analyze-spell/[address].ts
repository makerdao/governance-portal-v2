import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from '../../../../lib/maker';
import { getConnectedMakerObj } from '../../_lib/utils';
import { DEFAULT_NETWORK } from '../../../../lib/constants';
import withApiHandler from '../../_lib/withApiHandler';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getConnectedMakerObj(network);

  const [eta, datePassed, dateExecuted, mkrSupport] = await Promise.all([
    maker.service('spell').getEta(spellAddress),
    maker
      .service('spell')
      .getScheduledDate(spellAddress)
      /* tslint:disable:no-empty */
      .catch(_ => _), // this fails if the spell has not been scheduled
    maker
      .service('spell')
      .getExecutionDate(spellAddress)
      /* tslint:disable:no-empty */
      .catch(_ => _), // this fails if the spell has not been executed
    maker.service('chief').getApprovalCount(spellAddress)
  ]);
  const hasBeenCast = !!eta;

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res
    .status(200)
    .json({ hasBeenCast, eta, datePassed, dateExecuted, mkrSupport: mkrSupport.toBigNumber().toString() });
});
