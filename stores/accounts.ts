import create from 'zustand';

import getMaker from '@lib/maker';
import Account from '@types/account';
import oldVoteProxyFactoryAbi from '@lib/abis/oldVoteProxyFactoryAbi.json';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
import { getNetwork } from '@lib/maker';
import { StringLiteral } from '@babel/types';
import { oldVoteProxyFactoryAddress } from '@lib/constants';

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

type OldVoteProxy = {
  role: string;
  address: string;
};

type Store = {
  currentAccount?: Account;
  proxies: Record<string, VoteProxy | null>;
  oldProxy: OldVoteProxy;
  addAccountsListener: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
};

const getOldProxyStatus = async (address, maker) => {
  const oldFactory = maker
    .service('smartContract')
    .getContractByAddressAndAbi(oldVoteProxyFactoryAddress[getNetwork()], oldVoteProxyFactoryAbi);
  const [proxyAddressCold, proxyAddressHot] = await Promise.all([
    oldFactory.coldMap(address),
    oldFactory.hotMap(address)
  ]);
  if (proxyAddressCold !== ZERO_ADDRESS) return { role: 'cold', address: proxyAddressCold };
  if (proxyAddressHot !== ZERO_ADDRESS) return { role: 'hot', address: proxyAddressHot };
  return { role: '', address: '' };
};

const [useAccountsStore, accountsApi] = create<Store>((set, get) => ({
  currentAccount: undefined,
  proxies: {},
  oldProxy: { role: '', address: '' },

  addAccountsListener: async () => {
    const maker = await getMaker();
    maker.on('accounts/CHANGE', async ({ payload: { account } }) => {
      if (!account) {
        set({ currentAccount: account });
        return;
      }

      const { address } = account;
      const [{ hasProxy, voteProxy }, oldProxy] = await Promise.all([
        maker.service('voteProxy').getVoteProxy(address),
        getOldProxyStatus(address, maker)
      ]);
      set({
        currentAccount: account,
        proxies: { ...get().proxies, [address]: hasProxy ? voteProxy : null },
        oldProxy
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
