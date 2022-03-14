import { Dispatch, SetStateAction, useState } from 'react';
import useTransactionStore, {
  transactionsSelectors,
  transactionsApi
} from 'modules/web3/stores/transactions';
import { shallow } from 'zustand/shallow';
import { Transaction } from 'modules/web3/types/transaction';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { useAccount } from 'modules/app/hooks/useAccount';

type CreateResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<string | null>>;
  createPoll: (
    startDate: number,
    endDate: number,
    multiHash: string,
    url: string,
    callbacks?: Record<string, (id?: string) => void>
  ) => void;
  tx: Transaction | null;
};

export const usePollCreate = (): CreateResponse => {
  const [txId, setTxId] = useState<string | null>(null);

  const { account } = useAccount();
  // We want to use the original polling contract deployment for creating polls to avoid pollId collisions
  const { pollingOld } = useContracts();

  const [track, tx] = useTransactionStore(
    state => [state.track, txId ? transactionsSelectors.getTransaction(state, txId) : null],
    shallow
  );

  const createPoll = (startDate, endDate, multiHash, url, callbacks) => {
    const createTxCreator = () => pollingOld.createPoll(startDate, endDate, multiHash, url);
    const txId = track(createTxCreator, account, 'Creating poll', {
      initialized: () => {
        if (typeof callbacks?.initialized === 'function') callbacks.initialized();
      },
      pending: () => {
        if (typeof callbacks?.pending === 'function') callbacks.pending();
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Created poll');
        if (typeof callbacks?.mined === 'function') callbacks.mined();
      },
      error: () => {
        if (typeof callbacks?.error === 'function') callbacks.error();
      }
    });
    setTxId(txId);
  };

  return { txId, setTxId, createPoll, tx };
};
