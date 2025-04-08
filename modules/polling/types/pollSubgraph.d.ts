/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type PollSubgraph = {
  creator: string;
  pollId: number;
  blockCreated: number;
  startDate: number;
  endDate: number;
  multiHash: string;
  url: string;
};
