import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { isSupportedNetwork } from '../../../../lib/maker';
import { getConnectedMakerObj } from '../../_lib/utils';
import { DEFAULT_NETWORK } from '../../../../lib/constants';
import withApiHandler from '../../_lib/withApiHandler';
import SpellData from '@types/spellData';

export const analyzeSpell = async (address: string, maker: any): Promise<SpellData> => {
  const [done, eta, nextCastTime, datePassed, dateExecuted, mkrSupport] = await Promise.all([
    maker
      .service('spell')
      .getDone(address)
      .catch(_ => null), // this fails if the spell doesn't have the right ABI,
    maker
      .service('spell')
      .getNextCastTime(address)
      .catch(_ => null),
    maker
      .service('spell')
      .getEta(address)
      .catch(_ => null),
    maker
      .service('spell')
      .getScheduledDate(address)
      /* tslint:disable:no-empty */
      .catch(_ => null), // this fails if the spell has not been scheduled
    maker
      .service('spell')
      .getExecutionDate(address)
      /* tslint:disable:no-empty */
      .catch(_ => null), // this fails if the spell has not been executed
    maker.service('chief').getApprovalCount(address)
  ]);

  return {
    hasBeenCast: done,
    hasBeenScheduled: !!eta,
    eta,
    nextCastTime,
    datePassed,
    dateExecuted,
    mkrSupport: mkrSupport.toBigNumber().toString()
  };
};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getConnectedMakerObj(network);
  const analysis = await analyzeSpell(spellAddress, maker);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(analysis);
});
