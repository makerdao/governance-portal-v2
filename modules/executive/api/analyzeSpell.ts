// nextCastTime returns when the spell is available for execution, accounting for office hours (only works if the spell has not been executed yet)
// eta returns when the spell is available for execution, not account for office hours

import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { getSpellExecutionDate } from 'modules/web3/api/getSpellExecuationDate';
import { getSpellScheduledDate } from 'modules/web3/api/getSpellScheduledDate';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getSpellContract } from 'modules/web3/helpers/getSpellContract';
import { SpellData } from '../types';

// executiveHash returns the hash of the executive proposal
export const analyzeSpell = async (address: string, network: SupportedNetworks): Promise<SpellData> => {
  const spellContract = getSpellContract(address, network);

  const getDone = async () => {
    try {
      const done = await spellContract.done();
      return done;
    } catch (err) {
      return undefined;
    }
  };

  const getNextCastTime = async () => {
    try {
      const result = await spellContract.nextCastTime();
      if (!result.toNumber()) return undefined;
      const nextCastTime = new Date(result.toNumber() * 1000);
      return nextCastTime;
    } catch (err) {
      return undefined;
    }
  };

  const getEta = async () => {
    try {
      const result = await spellContract.eta();
      if (!result.toNumber()) return undefined;
      const eta = new Date(result.toNumber() * 1000);
      return eta;
    } catch (err) {
      return undefined;
    }
  };

  const getExpiration = async () => {
    try {
      const result = await spellContract.expiration();
      if (!result.toNumber()) return undefined;
      const expiration = new Date(result.toNumber() * 1000);
      return expiration;
    } catch (err) {
      return undefined;
    }
  };

  const getScheduledDate = async () => {
    try {
      const spellDate = await getSpellScheduledDate(address, network);
      return spellDate;
    } catch (err) {
      return undefined;
    }
  };

  const getExecutionDate = async () => {
    try {
      const executionDate = await getSpellExecutionDate(address, network);
      return executionDate;
    } catch (err) {
      return undefined;
    }
  };

  const getApprovals = async () => {
    try {
      const approvals = await getChiefApprovals(address, network);

      return approvals.toString();
    } catch (err) {
      return undefined;
    }
  };

  const getExecutiveHash = async () => {
    try {
      const description = await spellContract.description();
      const hash = description.substr(description.indexOf('0x'), description.length);
      return hash;
    } catch (err) {
      return undefined;
    }
  };

  const getOfficeHours = async () => {
    try {
      const officeHours = await spellContract.officeHours();
      return officeHours;
    } catch (err) {
      return undefined;
    }
  };

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
    getDone(),

    //nextCastTime
    getNextCastTime(),

    // eta
    getEta(),

    // expiration
    getExpiration(),

    // datePassed
    getScheduledDate(),

    // dateExecuted
    getExecutionDate(),

    // mkrSupport
    getApprovals(),

    // executiveHash
    getExecutiveHash(),

    // officeHours
    getOfficeHours()
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
