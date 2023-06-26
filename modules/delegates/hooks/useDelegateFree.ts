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
import { VoteDelegate } from '../../../types/ethers-contracts';
import { sendTransaction } from 'modules/web3/helpers/sendTransaction';

type FreeResponse = BaseTransactionResponse & {
  free: (mkrToWithdraw: BigNumber, callbacks?: Record<string, () => void>) => void;
};

export const useDelegateFree = (voteDelegateAddress: string): FreeResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { chainId, provider, account } = useWeb3();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const vdContract = getEthersContracts<VoteDelegate>(voteDelegateAddress, abi, chainId, provider, account);

  const free = (mkrToWithdraw: BigNumber, callbacks?: Record<string, () => void>) => {
    if (!account || !provider) {
      return;
    }

    const freeTxCreator = async () => {
      const populatedTransaction = await vdContract.populateTransaction.free(mkrToWithdraw);
      return sendTransaction(populatedTransaction, provider, account);
    };

    const txId = track(freeTxCreator, account, 'Withdrawing MKR', {
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawn');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR withdrawal failed');
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, free, tx };
};
