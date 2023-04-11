/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type CvcAndCount = {
  cvc_name: string;
  count: number;
};

export type CvcWithCountAndDelegates = CvcAndCount & {
  delegates: string[];
};

export type CvcStats = CvcAndCount & {
  totalMkr: number;
};
