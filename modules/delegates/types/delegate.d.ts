/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegateStatusEnum, DelegateTypeEnum } from '../delegates.constants';

export type GithubDelegate = {
  path: string;
  metadata: {
    name: string;
    external_profile_url: string;
    address: string;
    avatar?: string;
    tags?: string[];
  };
  metrics: {
    combined_participation: string;
    poll_participation: string;
    exec_participation: string;
    communication: string;
    start_date: string;
  };
};

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
  tags?: string[];
};

export type DelegateListItem = {
  voteDelegateAddress: string;
  picture?: string;
  name: string;
  externalUrl: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  tags?: string[];
};

export type DelegateContractInformation = {
  address: string;
  voteDelegateAddress: string;
  blockTimestamp: string;
  skyDelegated: string;
  proposalsSupported: number;
  skyLockedDelegate: SkyLockedDelegateApiResponse[];
  lastVoteDate: number | null;
};

export type Delegate = {
  id: string;
  name: string;
  address: string;
  voteDelegateAddress: string;
  description: string;
  picture: string;
  status: DelegateStatusEnum;
  lastVoteDate: number | null;
  externalUrl?: string;
  combinedParticipation?: string;
  pollParticipation?: string;
  executiveParticipation?: string;
  communication?: string;
  skyDelegated: string;
  proposalsSupported: number;
  execSupported: CMSProposal | undefined;
  skyLockedDelegate: SkyLockedDelegateApiResponse[];
  blockTimestamp: string;
};

export type DelegatePaginated = Omit<
  Delegate,
  | 'id'
  | 'blockTimestamp'
  | 'picture'
  | 'description'
  | 'lastVoteDate'
  | 'externalUrl'
  | 'execSupported'
  | 'skyLockedDelegate'
> & {
  picture?: string;
  creationDate: Date;
  delegatorCount: number;
  lastVoteDate?: Date;
  execSupported?: {
    title: string;
    address: string;
  };
};

export type DelegationHistory = {
  address: string;
  lockAmount: string;
  events: DelegationHistoryEvent[];
};

export type DelegationHistoryEvent = {
  lockAmount: string;
  blockTimestamp: string;
  hash: string;
  isStakingEngine?: boolean;
};

export type SkyLockedDelegateApiResponse = {
  immediateCaller: string;
  delegateContractAddress: string;
  lockAmount: string;
  blockNumber: number;
  blockTimestamp: string;
  lockTotal: string;
  callerLockTotal: string;
  hash: string;
  isStakingEngine?: boolean;
};

export type SKYDelegatedToResponse = SkyLockedDelegateApiResponse & {
  hash: string;
  immediateCaller: string;
};

export type DelegateExecSupport = {
  voteDelegate: string;
  votedProposals: string[];
};

export type AllDelegatesEntry = {
  blockTimestamp: Date;
  delegate: string;
  voteDelegate: string;
};

export type AllDelegatesEntryWithName = AllDelegatesEntry & {
  name?: string;
  picture?: string;
  delegateType: DelegateTypeEnum;
  blockTimestamp: Date;
};

export type DelegateInfo = Omit<DelegateRepoInformation, 'externalUrl' | 'description'> & {
  address: string;
  status: DelegateStatusEnum;
  blockTimestamp: Date;
};
