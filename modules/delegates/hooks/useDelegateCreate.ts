import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';

type LockResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<null>>;
  create: (callbacks?: Record<string, (id?: string) => void>) => void;
  tx: Transaction | null;
};

export const useDelegateCreate = (): LockResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  const { voteDelegateFactory } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const create = callbacks => {
    const freeTxCreator = () => voteDelegateFactory.create();
    const txId = track(freeTxCreator, account, 'Create delegate contract', {
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
