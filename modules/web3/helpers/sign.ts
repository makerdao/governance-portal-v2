/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { providers } from 'ethers';

export function sign(address: string, message: string, provider: providers.Web3Provider): Promise<string> {
  const signer = provider.getSigner(address);
  return signer.signMessage(message);
}
