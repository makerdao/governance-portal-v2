import create from 'zustand';
import getMaker from 'lib/maker';
import oldVoteProxyFactoryAbi from 'lib/abis/oldVoteProxyFactoryAbi.json';
import { getNetwork } from 'lib/maker';
import { oldVoteProxyFactoryAddress } from 'lib/constants';
import { Account } from 'types/account';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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

type VoteDelegateContract = {
  getVoteDelegateAddress: () => string
}

type Store = {
  // Holds the current active address for voting (delegate address, vote proxy or default account)
  activeAddress: string | undefined;
  currentAccount?: Account;
  proxies: Record<string, VoteProxy | null>;
  oldProxy: OldVoteProxy;
  voteDelegate: VoteDelegateContract | undefined;
  setVoteDelegate: (address: string) => Promise<void>;
  addAccountsListener: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
  isActingAsDelegate: boolean;
  setIsActingAsDelegate: (isActingAsDelegate: boolean) => void;
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
  activeAddress: undefined,
  currentAccount: undefined,
  proxies: {},
  oldProxy: { role: '', address: '' },
  voteDelegate: undefined,
  isActingAsDelegate: false,

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

      await get().setVoteDelegate(address);

      set({
        activeAddress: hasProxy ? voteProxy: address,
        currentAccount: account,
        proxies: { ...get().proxies, [address]: hasProxy ? voteProxy : null },
        oldProxy,
        isActingAsDelegate: false
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

  setIsActingAsDelegate: (isActingAsDelegate: boolean) => {
    // Toggles the active address
    const state = get();
    const normalAddress = state.currentAccount && !isActingAsDelegate ? state.currentAccount.address : undefined;
    const delegateAddress = state.voteDelegate && isActingAsDelegate ? state.voteDelegate.getVoteDelegateAddress(): undefined;
    const address = delegateAddress || normalAddress;
  
    set({
      isActingAsDelegate,
      activeAddress: address
    });
  },

  // explicitly setting this as `undefined` is an anti-pattern, but it's only a bandaid until
  // disconnect functionality is added to dai.js
  disconnectAccount: async () => {
    set({ currentAccount: undefined, isActingAsDelegate: false, activeAddress: undefined, voteDelegate: undefined });
  }
}));

export default useAccountsStore;
export { accountsApi };
 