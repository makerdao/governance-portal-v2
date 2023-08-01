/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { limitString } from 'lib/string';

// Splits an Aligned Delegate name into two strings: one for the AVC name and one
// for the actual delegate name, useful when displaying the name in small screens
export default function splitDelegateName(delegateName: string, limitTextLength: number): string[] {
  return delegateName.split(' - ').map(name => limitString(name, limitTextLength, '...'));
}
