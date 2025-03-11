/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { PublicClient, Transaction } from 'viem';
import { backoffRetry } from 'lib/utils';

export const getGaslessTransaction = async (
  gaslessPulicClient: PublicClient,
  hash: string
): Promise<Transaction> =>
  backoffRetry(3, () =>
    gaslessPulicClient.getTransaction({ hash: hash as `0x${string}` }).then(tx => {
      if (tx === null) throw new Error(`Transaction ${hash} not found on gasless network`);
      return tx;
    })
  );
