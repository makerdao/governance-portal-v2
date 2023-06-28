/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useState } from 'react';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { BigNumber } from 'ethers';
import { BaseTransactionResponse } from 'modules/web3/types/transaction';
import { VoteDelegate } from 'types/ethers-contracts';
import { sendTransaction } from 'modules/web3/helpers/sendTransaction';

type LockResponse = BaseTransactionResponse & {
  lock: (mkrToDeposit: BigNumber, callbacks?: Record<string, () => void>) => void;
};

export const useDelegateLock = (voteDelegateAddress: string): LockResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { chainId, provider, account } = useWeb3();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const vdContract = getEthersContracts<VoteDelegate>(voteDelegateAddress, abi, chainId, provider, account);

  const lock = (mkrToDeposit: BigNumber, callbacks?: Record<string, () => void>) => {
    if (!account || !provider) {
      return;
    }

    const lockTxCreator = async () => {
      const populatedTransaction = await vdContract.populateTransaction.lock(mkrToDeposit);
      return sendTransaction(populatedTransaction, provider, account);
    };

    const txId = track(lockTxCreator, account, 'Depositing MKR', {
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposited');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR deposit failed');
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, lock, tx };
};
