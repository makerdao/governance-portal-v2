/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { toBuffer } from 'lib/utils';

export function parseRawOptionId(rawValue?: string): number[] {
  let voteBallot: number[] = [];
  if (rawValue) {
    const ballotBuffer = toBuffer(rawValue, { endian: 'little' });
    const ballot = [...ballotBuffer];
    voteBallot = ballot.reverse();
  }

  return voteBallot;
}
