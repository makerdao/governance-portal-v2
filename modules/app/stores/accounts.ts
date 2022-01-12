import create from 'zustand';
import getMaker, { getNetwork } from 'lib/maker';
import { Account } from 'modules/app/types/account';
import { OldVoteProxyContract, VoteProxyContract } from 'modules/app/types/voteProxyContract';
import { VoteDelegateContract } from 'modules/delegates/types/voteDelegateContract';
import { getOldProxyStatus } from 'modules/mkr/lib/getOldProxyStatus';

type Store = {
  currentAccount?: Account;
  proxies: Record<string, VoteProxyContract | null>;
  oldProxy: OldVoteProxyContract;
  voteDelegate?: VoteDelegateContract;
  setVoteDelegate: (address: string) => Promise<void>;
  addAccountsListener: (maker) => Promise<void>;
  disconnectAccount: () => Promise<void>;
};

const [useAccountsStore, accountsApi] = create<Store>((set, get) => ({
  currentAccount: undefined,
  proxies: {},
  oldProxy: { role: '', address: '' },
  voteDelegate: undefined,

  addAccountsListener: async maker => {
    maker.on('accounts/CHANGE', async ({ payload: { account } }) => {
      if (!account) {
        set({ currentAccount: account });
        return;
      }

      const { address } = account;
      const [{ hasProxy, voteProxy }, oldProxy] = await Promise.all([
        maker.service('voteProxy').getVoteProxy(address),
        getOldProxyStatus(address, maker, getNetwork())
      ]);

      await get().setVoteDelegate(address);

      set({
        currentAccount: account,
        proxies: { ...get().proxies, [address]: hasProxy ? voteProxy : null },
        oldProxy
      });
    });
  },

  setVoteDelegate: async address => {
    const maker = await getMaker();
    const { voteDelegate } = await maker.service('voteDelegateFactory').getVoteDelegate(address);

    set({
      voteDelegate: voteDelegate ?? undefined
    });
  },

  // explicitly setting this as `undefined` is an anti-pattern, but it's only a bandaid until
  // disconnect functionality is added to dai.js
  disconnectAccount: async () => {
    set({ currentAccount: undefined });
  }
}));

export default useAccountsStore;
export { accountsApi };
