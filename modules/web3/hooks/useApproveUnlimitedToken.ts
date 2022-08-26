import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';
import shallow from 'zustand/shallow';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi,
  TxCallbacks
} from 'modules/web3/stores/transactions';
import { useAccount } from 'modules/app/hooks/useAccount';
import { Dispatch, SetStateAction, useState } from 'react';
import { Transaction } from 'modules/web3/types/transaction';

type ApproveResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<null>>;
  approve: (addressToApprove: string, callbacks?: TxCallbacks) => void;
  tx: Transaction | null;
};

export const useApproveUnlimitedToken = (name: ContractName): ApproveResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const token = useContracts()[name];

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approve = (addressToApprove: string, callbacks?: TxCallbacks) => {
    const approveTxCreator = () => token['approve(address)'](addressToApprove);
    const txId = track(approveTxCreator, account, `Approving ${name.toUpperCase()}`, {
      pending: txHash => {
        if (typeof callbacks?.pending === 'function') callbacks.pending(txHash);
      },
      mined: (txId, txHash) => {
        transactionsApi.getState().setMessage(txId, `${name.toUpperCase()} approved`);
        if (typeof callbacks?.mined === 'function') callbacks.mined(txId, txHash);
        setTxId(null);
      },
      error: (txId, e) => {
        transactionsApi.getState().setMessage(txId, `${name.toUpperCase()} approval failed`);
        if (typeof callbacks?.error === 'function') callbacks.error(txId, e);
        setTxId(null);
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, approve, tx };
};
