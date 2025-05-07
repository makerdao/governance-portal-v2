/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollListItem } from './poll';
import { PollTallyVote } from './pollTally';

export type PollVoteHistory = PollTallyVote & {
  poll: PollListItem;
  optionValue: string[];
};
