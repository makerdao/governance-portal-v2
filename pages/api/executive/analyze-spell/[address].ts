import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import getMaker, { isSupportedNetwork } from 'lib/maker';
import { SpellData } from 'modules/executive/types/spellData';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';

// nextCastTime returns when the spell is available for execution, accounting for office hours (only works if the spell has not been executed yet)
// eta returns when the spell is available for execution, not account for office hours
// executiveHash returns the hash of the executive proposal
export const analyzeSpell = async (address: string, maker: any): Promise<SpellData> => {
  const [
    done,
    nextCastTime,
    eta,
    expiration,
    datePassed,
    dateExecuted,
    mkrSupport,
    executiveHash,
    officeHours
  ] = await Promise.all([
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
      .getExpiration(address)
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
    maker.service('chief').getApprovalCount(address),
    maker
      .service('spell')
      .getExecutiveHash(address)
      .catch(_ => null),
    maker
      .service('spell')
      .getOfficeHours(address)
      .catch(_ => null)
  ]);

  return {
    hasBeenCast: done,
    hasBeenScheduled: !!eta,
    eta,
    expiration,
    nextCastTime,
    datePassed,
    dateExecuted,
    mkrSupport: mkrSupport.toBigNumber().toString(),
    executiveHash,
    officeHours
  };
};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const maker = await getMaker(network);
  const analysis = await analyzeSpell(spellAddress, maker);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(analysis);
});
