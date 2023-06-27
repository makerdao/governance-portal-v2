/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { providers, BigNumber } from 'ethers';

export async function sendTransaction(
  populatedTransaction: providers.TransactionRequest,
  provider: providers.Web3Provider,
  account: string
): Promise<providers.TransactionResponse> {
  let gasLimit: BigNumber;

  try {
    gasLimit = await provider.estimateGas(populatedTransaction);
  } catch (e) {
    console.log(`There was an error estimating gas, using default value instead. ${e.message}`);
    // In case the gas estimation fails, use ether's default of 90,000. This
    // is to avoid async calls inside the sendUncheckedTransaction function
    gasLimit = BigNumber.from(90_000);
  }

  populatedTransaction.gasLimit = gasLimit;
  const signer = provider.getSigner(account);
  const uncheckedTransaction = signer.sendUncheckedTransaction(populatedTransaction);
  const tx = await provider.getTransaction(uncheckedTransaction);

  return tx;
}
