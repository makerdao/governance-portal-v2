/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ethers } from 'ethers';

export function verifyTypedSignature(domain, types, message, signature) {
  return ethers.utils.verifyTypedData(domain, types, message, signature);
}
