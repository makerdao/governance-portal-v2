/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Tag } from 'modules/app/types/tag';
import {
  PollInputFormat,
  PollResultDisplay,
  PollStatusEnum,
  PollVictoryConditions,
  PollOrderByEnum
} from '../polling.constants';

//  { type : comparison, options: [0, 1, 4], comparator : '>=10000' }
export type PollVictoryConditionComparison = {
  type: PollVictoryConditions.comparison;
  options: number[];
  comparator: string;
  value: number;
};

// { type : default, value: 2 }
export type PollVictoryConditionDefault = {
  type: PollVictoryConditions.default;
  value: number;
};

// { type : majority, percent: 50 }
export type PollVictoryConditionMajority = {
  type: PollVictoryConditions.majority;
  percent: number;
};

// { type : 'plurality' }
export type PollVictoryConditionPlurality = {
  type: PollVictoryConditions.plurality;
};

// { type : 'instant-runoff' }
export type PollVictoryConditionInstantRunoff = {
  type: PollVictoryConditions.instantRunoff;
};

// { type : 'approval' }
export type PollVictoryConditionApproval = {
  type: PollVictoryConditions.approval;
};

// { type : 'and', conditions: conditions[] }
export type PollVictoryConditionAND = {
  type: PollVictoryConditions.and;
  conditions: VictoryCondition[];
};

export type VictoryCondition =
  | PollVictoryConditionComparison
  | PollVictoryConditionDefault
  | PollVictoryConditionMajority
  | PollVictoryConditionApproval
  | PollVictoryConditionInstantRunoff
  | PollVictoryConditionPlurality;

type PollParameters = {
  inputFormat: {
    type: PollInputFormat;
    abstain: number[];
    options: number[];
  };
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[];
  resultDisplay: PollResultDisplay;
};

export type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: Record<any, any>;
  endDate: Date;
  startDate: Date;
  discussionLink: string | null;
  parameters: PollParameters;
  tags: Tag[];
  slug: string;
  ctx: {
    prev: { slug: string } | null;
    next: { slug: string } | null;
  };
  url?: string;
};

export type PartialPoll = {
  multiHash: string;
  pollId: number;
  slug: string;
  startDate: Date;
  endDate: Date;
  url: string;
};

export type PollsValidatedQueryParams = {
  network: SupportedNetworks;
  pageSize: number;
  page: number;
  title: string | null;
  orderBy: PollOrderByEnum;
  tags: string[] | null;
  status: PollStatusEnum | null;
  type: PollInputFormat[] | null;
  startDate: Date | null;
  endDate: Date | null;
};

export type PollFilterQueryParams = Omit<PollsValidatedQueryParams, 'network'>;

export type PollListItem = Pick<
  Poll,
  'pollId' | 'multiHash' | 'slug' | 'title' | 'summary' | 'discussionLink' | 'parameters' | 'options'
> & {
  startDate: string;
  endDate: string;
  url: string;
  type: PollInputFormat;
  tags: string[];
};

export type PartialActivePoll = {
  pollId: number;
  startDate: Date;
  endDate: Date;
};

export type SubgraphPoll = {
  id: string;
  url: string;
  multiHash: string;
};
