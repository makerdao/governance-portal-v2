/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { providers } from 'ethers';

export async function sendTransaction(
  populatedTransaction: providers.TransactionRequest,
  provider: providers.Web3Provider,
  account: string
): Promise<providers.TransactionResponse> {
  const gasLimit = await provider.estimateGas(populatedTransaction);
  populatedTransaction.gasLimit = gasLimit;

  const signer = provider.getSigner(account);
  const uncheckedTransaction: any = await signer.sendUncheckedTransaction(populatedTransaction);

  const tx = await provider.getTransaction(uncheckedTransaction.hash);
  return tx;
}
