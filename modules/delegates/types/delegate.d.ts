/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Tag } from 'modules/app/types/tag';

export type DelegateStatus = 'recognized' | 'expired' | 'shadow';

export type DelegateRepoInformation = {
  voteDelegateAddress: string;
  picture?: string;
  name: string;
  externalUrl: string;
  description: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  cuMember?: boolean;
  tags?: string[];
};

export type DelegateContractInformation = {
  address: string;
  voteDelegateAddress: string;
  blockTimestamp: string;
  mkrDelegated: string;
  proposalsSupported: number;
  mkrLockedDelegate: MKRLockedDelegateAPIResponse[];
};

export type Delegate = {
  id: string;
  name: string;
  address: string;
  voteDelegateAddress: string;
  description: string;
  picture: string;
  status: DelegateStatus;
  lastVoteDate: number | null;
  expired: boolean;
  isAboutToExpire: boolean;
  expirationDate: Date;
  externalUrl?: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  cuMember?: boolean;
  mkrDelegated: string;
  proposalsSupported: number;
  execSupported: CMSProposal | undefined;
  mkrLockedDelegate: MKRLockedDelegateAPIResponse[];
  blockTimestamp: string;
  tags: Tag[];
  previous?: {
    address: string;
    voteDelegateAddress: string;
  };
  next?: {
    address: string;
    voteDelegateAddress: string;
  };
};

export type DelegationHistory = {
  address: string;
  lockAmount: string;
  events: DelegationHistoryEvent[];
};

export type DelegationHistoryWithExpirationDate = DelegationHistory & {
  expirationDate: Date;
  isAboutToExpire: boolean;
  isExpired: boolean;
  isRenewed: boolean;
};

export type DelegationHistoryEvent = {
  lockAmount: string;
  blockTimestamp: string;
  hash: string;
};

export type MKRLockedDelegateAPIResponse = {
  fromAddress: string;
  immediateCaller: string;
  delegateContractAddress: string;
  lockAmount: string;
  blockNumber: number;
  blockTimestamp: string;
  lockTotal: string;
  callerLockTotal: string;
  hash: string;
};

export type MKRDelegatedToDAIResponse = MKRLockedDelegateAPIResponse & {
  hash: string;
  immediateCaller: string;
};
