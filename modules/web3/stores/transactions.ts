import create from 'zustand';
import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from 'uuid';
// import getMaker from 'lib/maker';
import { Transaction, TXMined, TXPending, TXInitialized, TXError } from '../types/transaction';
import { parseTxError } from '../helpers/errors';
import { accountsApi } from '../../app/stores/accounts';
import { ethers } from 'ethers';
import { getNetwork } from 'lib/maker';

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
  track: (txCreator: () => Promise<any>, message?: string, hooks?: Hooks) => any;
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

  track: async (txCreator, message = '', hooks) => {
    const network = getNetwork();
    const provider = ethers.getDefaultProvider(network);
    const account = accountsApi.getState().currentAccount;

    if (!account) return;

    const from = account.address;

    const txId = uuidv4();

    get().initTx(txId, from, message);

    const txPromise = txCreator();
    const tx = await txPromise;
    // console.log('tx', tx);

    //Pending tx
    get().setPending(txId, tx.hash);
    if (typeof hooks?.pending === 'function') hooks.pending(tx.hash);

    //Mined tx
    provider.waitForTransaction(tx.hash).then(txn => {
      get().setMined(txId);
      if (typeof hooks?.mined === 'function') hooks.mined(txId, tx.hash);
    });

    // Error tx
    //TODO...
    return txId;
  }
  // track: async (txCreator, message = '', hooks) => {
  //   const maker = await getMaker();
  //   const txPromise = txCreator();
  //   // noop catch since we handle tx errors via the manager
  //   // eslint-disable-next-line @typescript-eslint/no-empty-function
  //   txPromise.catch(() => {});

  //   const from = maker.currentAddress();
  //   const txId = uuidv4();

  //   get().initTx(txId, from, message);
  //   maker.service('transactionManager').listen(txPromise, {
  //     pending: ({ hash }) => {
  //       get().setPending(txId, hash);
  //       if (typeof hooks?.pending === 'function') hooks.pending(hash);
  //     },
  //     mined: ({ hash }) => {
  //       get().setMined(txId);
  //       if (typeof hooks?.mined === 'function') hooks.mined(txId, hash);
  //     },
  //     error: (_, error) => {
  //       get().setError(txId, error);
  //       if (typeof hooks?.error === 'function') hooks.error();
  //     }
  //   });

  //   return txId;
  // }
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
