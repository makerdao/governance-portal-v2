/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ContractTransaction, providers } from 'ethers';
import { backoffRetry } from 'lib/utils';

export const getGaslessTransaction = async (
  gaslessProvider: providers.JsonRpcProvider,
  hash: string
): Promise<ContractTransaction> =>
  backoffRetry(3, () =>
    gaslessProvider.getTransaction(hash).then(tx => {
      if (tx === null) throw new Error(`Transaction ${hash} not found on gasless network`);
      return tx;
    })
  );
