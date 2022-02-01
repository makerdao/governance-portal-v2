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
  approve: () => void;
  tx: Transaction | null;
};

export const useApproveUnlimitedToken = (
  name: ContractName,
  addressToApprove: string,
  callbacks?: Record<string, () => void>
): ApproveResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const token = useContracts()[name];

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const approve = () => {
    const approveTxCreator = () => token['approve(address)'](addressToApprove);
    const txId = track(approveTxCreator, account, 'Approving MKR', {
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR approved');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: txId => {
        transactionsApi.getState().setMessage(txId, 'MKR approval failed');
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, approve, tx };
};
