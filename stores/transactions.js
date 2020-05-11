import create from 'zustand';

const [useTransactionStore, transactionApi] = create((set, get) => ({
  transactions: {},

  initTx: (from, txObject) => {
    const pastTxs = get().transactions[from];
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'initialized';
    set({
      transactions: {
        [from]: pastTxs.concat([
          { submittedAt, status, hash: null, error: null },
        ]),
      },
    });
  },

  setPending: (from, txObject) => {
    const submittedAt = txObject._timeStampSubmitted;
    const status = 'pending';
    set((state) => {
      const transaction = state.transactions[from].find(
        (tx) => tx.submittedAt === submittedAt
      );
      transaction.status = status;
      transaction.hash = hash;
      return state;
    });
  },

  send: (tx) => {
    maker.service('transactionManager').listen(tx, {
      initialized: ({ metadata: { action }, ...txObject }) => {
        const from = action.from;
        this.initTx(from, txObject);
      },
      pending: ({ metadata: { action }, ...txObject }) => {
        const from = action.from;
        this.setPending(from, txObject);
      },
      // mined: () => {
      //   dispatch({ type: 'mined' });
      // },
      // error: (_, err) => {
      //   dispatch({ type: 'error', payload: { msg: err.message } });
      // },
    });
  },
}));

export default useTransactionStore;
export { transactionApi };
