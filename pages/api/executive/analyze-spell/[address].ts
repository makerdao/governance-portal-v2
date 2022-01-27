import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { SpellData } from 'modules/executive/types/spellData';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getSpellContract } from 'modules/web3/helpers/getSpellContract';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { getSpellExecutionDate } from 'modules/web3/api/getSpellExecuationDate';
import { getSpellScheduledDate } from 'modules/web3/api/getSpellScheduledDate';

// nextCastTime returns when the spell is available for execution, accounting for office hours (only works if the spell has not been executed yet)
// eta returns when the spell is available for execution, not account for office hours
// executiveHash returns the hash of the executive proposal
export const analyzeSpell = async (address: string, network: SupportedNetworks): Promise<SpellData> => {
  const spellContract = getSpellContract(address, network);
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
    // done
    spellContract.done().catch(_ => null), // this fails if the spell doesn't have the right ABI,

    //nextCastTime
    spellContract
      .nextCastTime()
      .then(nextCastTime => {
        if (!nextCastTime.toNumber()) return undefined;
        return new Date(nextCastTime.toNumber() * 1000);
      })
      .catch(_ => null),

    // eta
    spellContract
      .eta()
      .then(eta => {
        if (!eta.toNumber()) return undefined;
        return new Date(eta.toNumber() * 1000);
      })
      .catch(_ => null),

    // expiration
    spellContract
      .expiration()
      .then(expiration => {
        if (!expiration.toNumber()) return undefined;
        return new Date(expiration.toNumber() * 1000);
      })
      .catch(_ => null),

    // datePassed
    getSpellScheduledDate(address, network),

    // dateExecuted
    getSpellExecutionDate(address, network),

    // mkrSupport
    getChiefApprovals(address, network),

    // executiveHash
    spellContract
      .description()
      .then(description => {
        return description.substr(description.indexOf('0x'), description.length);
      })
      .catch(_ => null),

    // officeHours
    spellContract.officeHours().catch(_ => null)
  ]);

  return {
    hasBeenCast: done,
    hasBeenScheduled: !!eta,
    eta,
    expiration,
    nextCastTime,
    datePassed,
    dateExecuted,
    mkrSupport,
    executiveHash,
    officeHours
  };
};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const analysis = await analyzeSpell(spellAddress, network);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(analysis);
});
