/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { verifyTypedData } from 'viem';

export function verifyTypedSignature(
  address: `0x${string}`,
  domain,
  types,
  message,
  primaryType,
  signature
): Promise<boolean> {
  return verifyTypedData({ domain, types, message, primaryType, signature, address });
}
