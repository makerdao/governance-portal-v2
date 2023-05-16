/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { BigNumber } from 'ethers';
import BigNumberJs from 'lib/bigNumberJs';
import { parseUnits } from 'ethers/lib/utils';
import { WAD } from 'modules/web3/constants/numbers';
import { PollVoteType } from './types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export const ABSTAIN = 0;

export const MIN_MKR_REQUIRED_FOR_GASLESS_VOTING = BigNumber.from(parseUnits('0.1'));
export const MIN_MKR_REQUIRED_FOR_GASLESS_VOTING_DISPLAY = new BigNumberJs(
  MIN_MKR_REQUIRED_FOR_GASLESS_VOTING.toString()
)
  .div(WAD.toString())
  .toFormat(1);
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

export const POLLS_HASH_FILE_URL = {
  [SupportedNetworks.MAINNET]:
    'https://raw.githubusercontent.com/hernandoagf/community/master/governance/polls/meta/hashed-polls.json',
  [SupportedNetworks.GOERLI]:
    'https://raw.githubusercontent.com/hernandoagf/community/master/governance/polls/meta/hashed-polls-goerli.json'
};

export const AGGREGATED_POLLS_FILE_URL = {
  [SupportedNetworks.MAINNET]:
    'https://raw.githubusercontent.com/hernandoagf/community/master/governance/polls/meta/polls.json',
  [SupportedNetworks.GOERLI]:
    'https://raw.githubusercontent.com/hernandoagf/community/master/governance/polls/meta/polls-goerli.json'
};
