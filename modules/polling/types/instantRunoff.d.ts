/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import BigNumber from 'lib/bigNumberJs';

export type InstantRunoffOption = {
  mkrSupport: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
};

type InstantRunoffOptions = { [key: number]: InstantRunoffOption };

export type InstantRunoffResults = {
  rounds: number;
  winner: number | null;
  options: InstantRunoffOptions;
};
