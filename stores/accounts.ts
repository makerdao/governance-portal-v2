import create from 'zustand';

import getMaker from '../lib/maker';
import Account from '../types/account';
import { devtools } from 'zustand/middleware';

type VoteProxy = {
  getProxyAddress: () => string;
  getColdAddress: () => string;
  getHotAddress: () => string;
  lock: () => Promise<any>;
  free: () => Promise<any>;
  voteExec: () => Promise<any>;
  getNumDeposits: () => Promise<any>;
  getVotedProposalAddresses: () => Promise<any>;
};

type Store = {
  currentAccount?: Account;
  proxies: Record<string, VoteProxy>;
  addAccountsListener: () => Promise<void>;
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
  }
}));

// if we are on the browser start listening for account changes as soon as possible
if (typeof window !== 'undefined') {
  accountsApi.getState().addAccountsListener();
}
export default useAccountsStore;
export { accountsApi };
