/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type BallotVote = {
  option: number | number[];
  comment?: string;
  transactionHash?: string;
};
export type Ballot = {
  [pollId: number]: BallotVote;
};
