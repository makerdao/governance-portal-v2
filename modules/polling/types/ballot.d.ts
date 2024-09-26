/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type BallotVote = {
  option: number | number[];
  transactionHash?: string;
};
export type Ballot = {
  [pollId: number]: BallotVote;
};
