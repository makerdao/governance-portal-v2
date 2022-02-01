import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { BigNumber } from 'ethers';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';

type LockResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<null>>;
  lock: () => void;
  tx: Transaction | null;
};

export const useLock = (mkrToDeposit: BigNumber, callbacks?: Record<string, () => void>): LockResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account, voteProxyContract } = useAccount();
  const { chief } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const lock = () => {
    const lockTxCreator = voteProxyContract
      ? () => voteProxyContract.lock(mkrToDeposit)
      : () => chief.lock(mkrToDeposit);

    const transactionId = track(lockTxCreator, account, 'Depositing MKR', {
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
    setTxId(transactionId);
  };

  return { txId, setTxId, lock, tx };
};
