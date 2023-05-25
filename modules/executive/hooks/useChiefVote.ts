/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { sendTransaction } from 'modules/web3/helpers/sendTransaction';

type VoteResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<string | null>>;
  vote: (slateOrProposals: any, callbacks?: Record<string, (id: string) => void>) => void;
  tx: Transaction | null;
};

export const useChiefVote = (): VoteResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const { provider } = useWeb3();
  const { chief } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const vote = (slateOrProposals: any, callbacks?: Record<string, (id: string) => void>) => {
    if (!account || !provider) {
      return;
    }

    const voteTxCreator = async () => {
      const populatedTransaction = Array.isArray(slateOrProposals)
        ? await chief.populateTransaction['vote(address[])'](slateOrProposals)
        : await chief.populateTransaction['vote(bytes32)'](slateOrProposals);

      return sendTransaction(populatedTransaction, provider, account);
    };

    const transactionId = track(voteTxCreator, account, 'Voting on executive proposal', {
      initialized: txId => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized(txId);
      },
      pending: hash => {
        if (typeof callbacks?.pending === 'function') callbacks.pending(hash);
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Voted on executive proposal');
        if (typeof callbacks?.mined === 'function') callbacks.mined(txId);
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
        if (typeof callbacks?.error === 'function') callbacks.error(txId);
      }
    });
    setTxId(transactionId);
  };

  return { txId, setTxId, vote, tx };
};
