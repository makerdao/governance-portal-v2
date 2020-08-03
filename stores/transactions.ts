import create from 'zustand';
import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from 'uuid';

import { parseTxError } from '../lib/errors';
import getMaker from '../lib/maker';
import TX from '../types/transaction';

type Store = {
  transactions: TX[];
  initTx: (txId: string, from: string, message: string | null) => void;
  setPending: (txId: string, hash: string) => void;
  setMined: (txId: string) => void;
  setError: (txId: string, error?: { message: string }) => void;
  track: (txCreator: () => Promise<any>, message?: string) => any;
  getTransaction: (txId: string) => TX;
};

const [useTransactionsStore, transactionsApi] = create<Store>((set, get) => ({
  transactions: [],

  initTx: (txId, from, message) => {
    const status = 'initialized';
    set({
      transactions: get().transactions.concat([
        {
          from,
          id: txId,
          status,
          message,
          submittedAt: new Date(),
          hash: null,
          error: null,
          errorType: null
        }
      ])
    });
  },

  setPending: (txId, hash) => {
    const status = 'pending';
    set(state => {
      const transaction = state.transactions.find(tx => tx.id === txId);
      invariant(transaction, `Unable to find tx id ${txId}`);
      transaction.status = status;
      transaction.hash = hash;
      return state;
    });
  },

  setMined: txId => {
    const status = 'mined';
    set(state => {
      const transaction = state.transactions.find(tx => tx.id === txId);
      invariant(transaction, `Unable to find tx id ${txId}`);
      transaction.status = status;
      return state;
    });
  },

  setError: (txId, error) => {
    const status = 'error';
    set(state => {
      const transaction = state.transactions.find(tx => tx.id === txId);
      invariant(transaction, `Unable to find tx id ${txId}`);
      const errorType = transaction.hash ? 'failed' : 'not sent';
      transaction.status = status;
      transaction.error = error?.message ? parseTxError(error.message) : null;
      transaction.errorType = errorType;
      return state;
    });
  },

  track: async (txCreator, message = '') => {
    const maker = await getMaker();
    const txPromise = txCreator();
    // noop catch since we handle tx errors via the manager
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    txPromise.catch(() => {});

    const from = maker.currentAddress();
    const txId = uuidv4();

    get().initTx(txId, from, message);
    maker.service('transactionManager').listen(txPromise, {
      pending: ({ hash }) => {
        get().setPending(txId, hash);
      },
      mined: () => {
        get().setMined(txId);
      },
      error: (_, error) => {
        get().setError(txId, error);
      }
    });

    return txId;
  },

  getTransaction: txId => {
    const tx = get().transactions.find(tx => tx.id === txId);
    invariant(tx, `Unable to find tx id ${txId}`);
    return tx;
  }
}));

export default useTransactionsStore;
export { transactionsApi };
