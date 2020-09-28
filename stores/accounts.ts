import create from 'zustand';

import getMaker from '../lib/maker';
import Account from '../types/account';

type Store = {
  currentAccount?: Account;
  addAccountsListener: () => Promise<void>;
};

const [useAccountsStore, accountsApi] = create<Store>((set, get) => ({
  currentAccount: undefined,

  addAccountsListener: async () => {
    const maker = await getMaker();
    maker.on('accounts/CHANGE', ({ payload }) => {
      set({ currentAccount: payload.account });
    });
  }
}));

// if we are on the browser start listening for account changes as soon as possible
if (typeof window !== 'undefined') {
  accountsApi.getState().addAccountsListener();
}
export default useAccountsStore;
export { accountsApi };
