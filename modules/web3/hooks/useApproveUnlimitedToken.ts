import { ContractName } from '../types/contracts';
import { useContracts } from './useContracts';
import shallow from 'zustand/shallow';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { useAccount } from 'modules/app/hooks/useAccount';
import { Dispatch, SetStateAction, useState } from 'react';
import { Transaction } from 'modules/web3/types/transaction';

type ApproveResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<null>>;
  approve: (
    addressToApprove: string,
    callbacks?: {
      mined?: () => void;
      pending?: () => void;
      error?: () => void;
    }
  ) => void;
  tx: Transaction | null;
};

export const useApproveUnlimitedToken = (name: ContractName): ApproveResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const token = useContracts({ readOnly: false })[name];

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approve = (
    addressToApprove: string,
    callbacks?: {
      mined?: () => void;
      pending?: () => void;
      error?: () => void;
    }
  ) => {
    const approveTxCreator = () => token['approve(address)'](addressToApprove);
    const txId = track(approveTxCreator, account, `Approving ${name.toUpperCase()}`, {
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, `${name.toUpperCase()} approved`);
        if (typeof callbacks?.mined === 'function') callbacks.mined();
        setTxId(null);
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, `${name.toUpperCase()} approval failed`);
        if (typeof callbacks?.error === 'function') callbacks.error();
        setTxId(null);
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, approve, tx };
};
