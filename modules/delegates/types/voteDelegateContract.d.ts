/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type VoteDelegateContract = {
  getVoteDelegateAddress: () => string;
  voteExec: (picks: string[] | string) => Promise<any>;
  votePoll: (pollIds: string[], pollOptions: string[]) => Promise<any>;
};
