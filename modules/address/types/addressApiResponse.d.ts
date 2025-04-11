/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';
import { Delegate } from 'modules/delegates/types';

export type AddressAPIStats = {
  pollVoteHistory: PollVoteHistory[];
  lastVote: PollVoteHistory;
};

export type AddressApiResponse = {
  isDelegate: boolean;
  delegateInfo?: Delegate;
  address: string;
  voteDelegateAdress?: string;
};
