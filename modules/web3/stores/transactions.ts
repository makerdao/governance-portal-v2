import create from 'zustand';
import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from 'uuid';
import { ContractTransaction } from 'ethers';
import { Transaction, TXMined, TXPending, TXInitialized, TXError } from '../types/transaction';
import { parseTxError } from '../helpers/errors';

type Hooks = {
  pending?: (txHash: string) => void;
  mined?: (txId: string, txHash: string) => void;
  error?: () => void;
};

type Store = {
  transactions: Transaction[];
  initTx: (txId: string, from: string, message: string | null) => void;
  setMessage: (txId: string, message: string | null) => void;
  setPending: (txId: string, hash: string) => void;
  setMined: (txId: string) => void;
  setError: (txId: string, error?: { message: string }) => void;
  track: (
    txCreator: () => Promise<ContractTransaction>,
    account?: string,
    message?: string,
    hooks?: Hooks
  ) => any;
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
  setMessage: (txId, message) => {
    set(({ transactions }) => {
      const transactionIndex = transactions.findIndex(tx => tx.id === txId);
      invariant(transactionIndex >= 0, `Unable to find tx id ${txId}`);
      const prevState = transactions[transactionIndex];
      const nextState = {
        ...prevState,
        message
      };
      transactions[transactionIndex] = nextState;
      return { transactions };
    });
  },

  setPending: (txId, hash) => {
    const status = 'pending';
    set(({ transactions }) => {
      const transactionIndex = transactions.findIndex(tx => tx.id === txId);
      invariant(transactionIndex >= 0, `Unable to find tx id ${txId}`);
      const prevState = transactions[transactionIndex] as TXInitialized;
      const nextState: TXPending = {
        ...prevState,
        status,
        hash
      };

      transactions[transactionIndex] = nextState;
      return { transactions };
    });
  },

  setMined: txId => {
    const status = 'mined';
    set(({ transactions }) => {
      const transactionIndex = transactions.findIndex(tx => tx.id === txId);
      invariant(transactionIndex >= 0, `Unable to find tx id ${txId}`);
      const prevState = transactions[transactionIndex] as TXPending;
      const nextState: TXMined = {
        ...prevState,
        status
      };

      transactions[transactionIndex] = nextState;
      return { transactions };
    });
  },

  setError: (txId, error) => {
    const status = 'error';
    set(({ transactions }) => {
      const transactionIndex = transactions.findIndex(tx => tx.id === txId);
      invariant(transactionIndex >= 0, `Unable to find tx id ${txId}`);
      const prevState = transactions[transactionIndex] as Transaction;
      const nextState: TXError = {
        ...prevState,
        status,
        error: error?.message ? parseTxError(error.message) : null,
        errorType: transactions[transactionIndex].hash ? 'failed' : 'not sent'
      };

      transactions[transactionIndex] = nextState;

      return { transactions };
    });
  },

  track: async (txCreator, account, message = '', hooks) => {
    if (!account) {
      return;
    }

    const txId = uuidv4();

    get().initTx(txId, account, message);

    const txPromise = txCreator();
    const tx = await txPromise;

    // We are in "pending" state because the txn has now been been sent
    get().setPending(txId, tx.hash);
    if (typeof hooks?.pending === 'function') hooks.pending(tx.hash);

    // Handle mined or error txns
    tx.wait()
      .then(txn => {
        get().setMined(txId);
        if (typeof hooks?.mined === 'function') hooks.mined(txId, tx.hash);
      })
      .catch(e => {
        get().setError(txId, e);
        if (typeof hooks?.error === 'function') hooks.error();
      });

    return txId;
  }
}));

const transactionsSelectors = {
  getTransaction: (state, txId): Transaction => {
    const tx = state.transactions.find(tx => tx.id === txId);
    invariant(tx, `Unable to find tx id ${txId}`);
    return tx;
  }
};

export default useTransactionsStore;
export { transactionsApi, transactionsSelectors };
