/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export const getExecutiveVotingWeightCopy = (isVotingDelegate: boolean): string =>
  isVotingDelegate
    ? 'Your executive voting weight is made up of the SKY delegated to your delegate contract. This amount is applied to any executives you support.'
    : 'Your executive voting weight is made up of the SKY in the voting contract. This amount is applied to any executives you support.';
