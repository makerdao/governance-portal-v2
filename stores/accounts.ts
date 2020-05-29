import create from 'zustand';

import getMaker, { getNetwork, chainIdToNetworkName } from '../lib/maker';

const [useAccountsStore, accountsApi] = create((set, get) => ({
  currentAccount: null,
  wrongNetwork: false,

  canSendTransactions: () => !!get().currentAccount && !get().wrongNetwork,

  addAccountsListener: async () => {
    const maker = await getMaker();
    maker.on('accounts/CHANGE', ({ payload }) => {
      set({ currentAccount: payload.account });
    });
  },

  connectWithBrowserProvider: async () => {
    const maker = await getMaker();
    const currentNetwork = getNetwork();
    let providerNetwork;
    let providerAddress;
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        if ((window as any).ethereum.enable) {
          [providerAddress] = await (window as any).ethereum.enable();
        } else {
          [providerAddress] = await (window as any).ethereum.send('eth_requestAccounts');
        }
        providerNetwork = chainIdToNetworkName(parseInt((window as any).ethereum.chainId));
      } catch (err) {
        window.alert(err.message);
        return;
      }
    } else {
      window.alert('No web3 provider detected');
      return;
    }

    if (providerNetwork !== currentNetwork) {
      window.alert(
        `MetaMask is connected to ${providerNetwork} but the page is connected to ${currentNetwork}. 
Please add ?network=${providerNetwork} to the URL, or switch MetaMask to ${currentNetwork}. 
The UI will be put in read-only mode in the meantime. (note: only kovan and mainnet are supported)`
      );
      set({ wrongNetwork: true });
      return;
    }
    set({ wrongNetwork: false });

    if (!providerAddress || !providerAddress.match(/^0x[a-fA-F0-9]{40}$/))
      throw new Error('browser ethereum provider providing incorrect or non-existent address');

    const makerAddresses = new Set(maker.listAccounts().map(acc => acc.address));

    if (makerAddresses.has(providerAddress)) {
      console.log(`Using existing SDK account: ${providerAddress}`);
      maker.useAccountWithAddress(providerAddress);
    } else {
      console.log('Adding new browser account to SDK');
      await maker.addAccount({
        type: 'browser',
        autoSwitch: true
      });
      maker.useAccountWithAddress(providerAddress);
    }

    return providerAddress;
  }
}));

// if we are on the browser start listening for account changes as soon as possible
if (typeof window !== 'undefined') {
  accountsApi.getState().addAccountsListener();
}
export default useAccountsStore;
export { accountsApi };
