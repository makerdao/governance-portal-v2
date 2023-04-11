/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export function getIsMetaMask(): boolean {
  return window?.ethereum?.isMetaMask ?? false;
}
