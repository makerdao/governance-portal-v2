/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { TagCount } from 'modules/app/types/tag';
import { Poll } from './poll';

export type PollFilters = {
  startDate?: Date | null;
  endDate?: Date | null;
  tags?: string[] | null;
  active?: boolean | null;
};
export type PollsResponse = {
  polls: Poll[];
  tags: TagCount[];
  stats: {
    active: number;
    finished: number;
    total: number;
  };
};
