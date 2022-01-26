import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { SpellData } from 'modules/executive/types/spellData';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { getSpellContract } from 'modules/web3/helpers/getSpellContract';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';

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
    spellContract.done().catch(_ => null), // this fails if the spell doesn't have the right ABI,
    spellContract
      .nextCastTime()
      .then(nextCastTime => {
        if (!nextCastTime.toNumber()) return undefined;
        return new Date(nextCastTime.toNumber() * 1000);
      })
      .catch(_ => null),
    spellContract
      .eta()
      .then(eta => {
        if (!eta.toNumber()) return undefined;
        return new Date(eta.toNumber() * 1000);
      })
      .catch(_ => null),
    spellContract
      .expiration()
      .then(expiration => {
        if (!expiration.toNumber()) return undefined;
        return new Date(expiration.toNumber() * 1000);
      })
      .catch(_ => null),
    // this is complicated
    // async getScheduledDate(spellAddress) {
    //   if (this.scheduledDate[spellAddress])
    //     return this.scheduledDate[spellAddress];
    //   const eta = await this.getEta(spellAddress);
    //   assert(eta, `spell ${spellAddress} has not been scheduled`);
    //   const pauseAddress = this._pauseContract().address;
    //   const web3Service = this.get('web3');
    //   const netId = web3Service.network;
    //   const networkName = netIdToName(netId);
    //   const paddedSpellAddress =
    //     '0x' + padStart(spellAddress.replace(/^0x/, ''), 64, '0');
    //   const [plotEvent] = await web3Service.getPastLogs({
    //     fromBlock: pauseInfo.inception_block[networkName],
    //     toBlock: 'latest',
    //     address: pauseAddress,
    //     topics: [pauseInfo.events.plot, paddedSpellAddress]
    //   });
    //   const { timestamp } = await web3Service.getBlock(plotEvent.blockNumber);
    //   this.scheduledDate[spellAddress] = new Date(timestamp * 1000);
    //   return this.scheduledDate[spellAddress];
    // }
    // TODO replicate the above, yikes
    spellContract
      .eta()
      .then(eta => {
        if (!eta.toNumber()) return undefined;
        return new Date(eta.toNumber() * 1000);
      })
      .catch(_ => null),
    // async getExecutionDate(spellAddress) {
    //   if (this.executionDate[spellAddress])
    //     return this.executionDate[spellAddress];
    //   const done = await this.getDone(spellAddress);
    //   assert(done, `spell ${spellAddress} has not been executed`);
    //   const pauseAddress = this._pauseContract().address;
    //   const web3Service = this.get('web3');
    //   const netId = web3Service.network;
    //   const networkName = netIdToName(netId);
    //   const paddedSpellAddress =
    //     '0x' + padStart(spellAddress.replace(/^0x/, ''), 64, '0');
    //   const [execEvent] = await web3Service.getPastLogs({
    //     fromBlock: pauseInfo.inception_block[networkName],
    //     toBlock: 'latest',
    //     address: pauseAddress,
    //     topics: [pauseInfo.events.exec, paddedSpellAddress]
    //   });
    //   const { timestamp } = await web3Service.getBlock(execEvent.blockNumber);
    //   this.executionDate[spellAddress] = new Date(timestamp * 1000);
    //   return this.executionDate[spellAddress];
    // }
    // TODO replicate the above, yikes
    spellContract
      .done()
      .then(done => {
        // spell not executed
        if (!done) return null;
      })
      .catch(_ => null),
    getChiefApprovals(address, network),
    spellContract
      .description()
      .then(description => {
        return description.substr(description.indexOf('0x'), description.length);
      })
      .catch(_ => null),
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
