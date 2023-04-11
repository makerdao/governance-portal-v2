/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

type ContractDiff = {
  [contractLabel: string]: {
    from: number | string;
    to: number | string;
    name: string;
    field: string | null;
    keys: string[] | null;
  }[];
};

export type SpellStateDiff =
  | {
      hasBeenCast: true;
      executedOn: number;
      groupedDiff: ContractDiff;
    }
  | {
      hasBeenCast: false;
      executedOn: null;
      groupedDiff: ContractDiff;
    };
