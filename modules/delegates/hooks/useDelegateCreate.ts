/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { BaseTransactionResponse } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { sendTransaction } from 'modules/web3/helpers/sendTransaction';

type CreateResponse = BaseTransactionResponse & {
  create: (callbacks?: Record<string, (id?: string) => void>) => void;
};

export const useDelegateCreate = (): CreateResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const { provider } = useWeb3();
  const { voteDelegateFactory } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const create = callbacks => {
    if (!account || !provider) {
      return;
    }

    const createTxCreator = async () => {
      const populatedTransaction = await voteDelegateFactory.populateTransaction.create();
      return sendTransaction(populatedTransaction, provider, account);
    };

    const txId = track(createTxCreator, account, 'Create delegate contract', {
      initialized: () => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized();
      },
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Delegate contract created');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId as string, 'Delegate contract failed');
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, create, tx };
};
