/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export function goatcounterTrack(path: string, title: string, event = true) {
  if (window.goatcounter) {
    window.goatcounter.count({ path, title, event });
  }
}
