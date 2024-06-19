/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type AvcAndCount = {
  avc_name: string;
  count: number;
  picture?: string;
};

export type AvcWithCountAndDelegates = AvcAndCount & {
  delegates: string[];
};
