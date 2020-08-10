// this is separate from the rest of the plugin code to avoid circular importing

// TODO: handle account disconnection (e.g. when WalletConnect access is revoked)
// by handling Web3ReactDeactivate event

import { useEffect } from 'react';
import getMaker from '../../maker';

export const syncMakerAccount = (library, account) => {
  useEffect(() => {
    (async () => {
      if (!library || !account) return;

      // check to see if the account already exists (i.e. switching back to one that was already added)
      // before adding it
      const maker = await getMaker();
      const accounts = maker.listAccounts();
      if (accounts.some(a => a.address.toLowerCase() === account.toLowerCase())) {
        maker.useAccountWithAddress(account);
      } else {
        await maker.addAccount({ type: 'web3-react', library, address: account });
      }
    })();
  }, [library, account]);
};