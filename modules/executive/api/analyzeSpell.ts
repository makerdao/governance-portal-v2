/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

// nextCastTime returns when the spell is available for execution, accounting for office hours (only works if the spell has not been executed yet)
// eta returns when the spell is available for execution, not account for office hours

import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { getSpellExecutionDate } from 'modules/web3/api/getSpellExecuationDate';
import { getSpellScheduledDate } from 'modules/web3/api/getSpellScheduledDate';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { SpellData } from '../types';
import logger from 'lib/logger';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { dssSpellAbi } from 'modules/contracts/generated';

export const getExecutiveMKRSupport = async (
  address: string,
  network: SupportedNetworks
): Promise<string> => {
  try {
    const approvals = await getChiefApprovals(address, network);
    return approvals.toString();
  } catch (e) {
    logger.error(`getExecutiveMKRSupport: Error fetching approvals for ${address} on ${network}`, e);
    return new Promise<string>(res => res('0'));
  }
};

// executiveHash returns the hash of the executive proposal
export const analyzeSpell = async (address: string, network: SupportedNetworks): Promise<SpellData> => {
  const chainId = networkNameToChainId(network);

  // don't fetch spell data if not on mainnet
  if (network !== SupportedNetworks.MAINNET) {
    const approvals = await getChiefApprovals(address, network);

    return {
      hasBeenCast: undefined,
      hasBeenScheduled: false,
      eta: undefined,
      expiration: undefined,
      nextCastTime: undefined,
      datePassed: undefined,
      dateExecuted: undefined,
      mkrSupport: approvals.toString(),
      executiveHash: undefined,
      officeHours: undefined
    };
  }

  const publicClient = getPublicClient(chainId);
  const readSpellParameters = {
    address: address as `0x${string}`,
    abi: dssSpellAbi
  };

  const getDone = async () => {
    try {
      const done = await publicClient.readContract({ ...readSpellParameters, functionName: 'done' });
      return done;
    } catch (err) {
      return undefined;
    }
  };

  const getNextCastTime = async () => {
    try {
      const result = await publicClient.readContract({
        ...readSpellParameters,
        functionName: 'nextCastTime'
      });
      if (!Number(result)) return undefined;
      const nextCastTime = new Date(Number(result) * 1000);
      return nextCastTime;
    } catch (err) {
      return undefined;
    }
  };

  const getEta = async () => {
    try {
      const result = await publicClient.readContract({ ...readSpellParameters, functionName: 'eta' });
      if (!Number(result)) return undefined;
      const eta = new Date(Number(result) * 1000);
      return eta;
    } catch (err) {
      return undefined;
    }
  };

  const getExpiration = async () => {
    try {
      const result = await publicClient.readContract({ ...readSpellParameters, functionName: 'expiration' });
      if (!Number(result)) return undefined;
      const expiration = new Date(Number(result) * 1000);
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
      return '0';
    }
  };

  const getExecutiveHash = async () => {
    try {
      const description = await publicClient.readContract({
        ...readSpellParameters,
        functionName: 'description'
      });
      const hash = description.substr(description.indexOf('0x'), description.length);
      return hash;
    } catch (err) {
      return undefined;
    }
  };

  const getOfficeHours = async () => {
    try {
      const officeHours = await publicClient.readContract({
        ...readSpellParameters,
        functionName: 'officeHours'
      });
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
