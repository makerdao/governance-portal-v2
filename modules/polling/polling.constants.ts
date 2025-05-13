/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { formatEther, parseEther } from 'viem';
import { PollVoteType } from './types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export const ABSTAIN = 0;

export const MIN_SKY_REQUIRED_FOR_GASLESS_VOTING = parseEther('20');
export const MIN_SKY_REQUIRED_FOR_GASLESS_VOTING_DISPLAY = parseFloat(
  formatEther(MIN_SKY_REQUIRED_FOR_GASLESS_VOTING)
).toLocaleString();
export const GASLESS_RATE_LIMIT_IN_MS = TEN_MINUTES_IN_MS;

export const POLL_VOTE_TYPE = {
  PLURALITY_VOTE: 'Plurality Voting' as PollVoteType,
  RANKED_VOTE: 'Ranked Choice IRV' as PollVoteType,
  UNKNOWN: 'Unknown' as PollVoteType
};

export const POLL_VOTE_TYPES_ARRAY: PollVoteType[] = [
  POLL_VOTE_TYPE.PLURALITY_VOTE,
  POLL_VOTE_TYPE.RANKED_VOTE
];

// Poll parameters
export enum PollInputFormat {
  singleChoice = 'single-choice',
  rankFree = 'rank-free',
  chooseFree = 'choose-free',
  majority = 'majority'
}

export enum PollVictoryConditions {
  and = 'and',
  majority = 'majority',
  approval = 'approval',
  plurality = 'plurality',
  instantRunoff = 'instant-runoff',
  default = 'default',
  comparison = 'comparison'
}

export enum PollResultDisplay {
  singleVoteBreakdown = 'single-vote-breakdown',
  instantRunoffBreakdown = 'instant-runoff-breakdown',
  approvalBreakdown = 'approval-breakdown'
}

export enum PollOrderByEnum {
  nearestEnd = 'NEAREST_END',
  furthestEnd = 'FURTHEST_END',
  nearestStart = 'NEAREST_START',
  furthestStart = 'FURTHEST_START'
}

export enum PollStatusEnum {
  active = 'ACTIVE',
  ended = 'ENDED'
}

export const AGGREGATED_POLLS_FILE_URL = {
  [SupportedNetworks.MAINNET]: 'https://raw.githubusercontent.com/makerdao/polls/refs/heads/main/index.json',
  [SupportedNetworks.TENDERLY]:
    'https://raw.githubusercontent.com/jetstreamgg/polls/refs/heads/testnet/index.json'
};

export const SKY_PORTAL_START_DATE_MAINNET = new Date('2025-05-19');
export const SKY_PORTAL_START_DATE_TENDERLY = new Date('2025-03-17');

export function getSkyPortalStartDate(network?: SupportedNetworks): Date {
  if (network === SupportedNetworks.TENDERLY) {
    return SKY_PORTAL_START_DATE_TENDERLY;
  }
  return SKY_PORTAL_START_DATE_MAINNET;
}

export const POLL_CREATOR_WHITELIST = [
  '0x9f8046bDfbF4B65ad12D6Bcf37Fc2745706dFFa1',
  '0xdc7ee5da5d011bc98cf030968659f3ee92232843',
  '0x8541cCfc6E7EAcEbD233C6789a0FbF7C708B0E68',
  '0x777CC2b5ec4c50b5aec0C0d9f8d1b8599Ef2A54C'
];
