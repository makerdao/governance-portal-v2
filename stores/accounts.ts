import create from 'zustand';

import getMaker from '../lib/maker';
import Account from '../types/account';

type VoteProxy = {
  getProxyAddress: () => string;
  getColdAddress: () => string;
  getHotAddress: () => string;
  lock: () => Promise<any>;
  free: () => Promise<any>;
  voteExec: (picks: string[] | string) => Promise<any>;
  getNumDeposits: () => Promise<any>;
  getVotedProposalAddresses: () => Promise<any>;
};

type Store = {
  currentAccount?: Account;
  proxies: Record<string, VoteProxy | null>;
  addAccountsListener: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
};

const [useAccountsStore, accountsApi] = create<Store>((set, get) => ({
  currentAccount: undefined,
  proxies: {},

  addAccountsListener: async () => {
    const maker = await getMaker();
    maker.on('accounts/CHANGE', async ({ payload: { account } }) => {
      if (!account) {
        set({ currentAccount: account });
        return;
      }

      const { address } = account;
      const { hasProxy, voteProxy } = await maker.service('voteProxy').getVoteProxy(address);
      set({
        currentAccount: account,
        proxies: { ...get().proxies, [address]: hasProxy ? voteProxy : null }
      });
    });
  },

  // explicitly setting this as `undefined` is an anti-pattern, but it's only a bandaid until
  // disconnect functionality is added to dai.js
  disconnectAccount: async () => {
    set({ currentAccount: undefined });
  }
}));

// if we are on the browser start listening for account changes as soon as possible
if (typeof window !== 'undefined') {
  accountsApi.getState().addAccountsListener();
}
export default useAccountsStore;
export { accountsApi };
