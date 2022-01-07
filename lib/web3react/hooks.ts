// this is separate from the rest of the plugin code to avoid circular importing

// TODO: handle account disconnection (e.g. when WalletConnect access is revoked)
// by handling Web3ReactDeactivate event

import { useContext, useEffect } from 'react';

import getMaker from '../maker/index';
import { AnalyticsContext } from 'modules/app/client/analytics/AnalyticsContext';

export const syncMakerAccount = (library, account, chainIdError) => {
  const { identifyUser } = useContext(AnalyticsContext);
  useEffect(() => {
    (async () => {
      if (!library || !account || !!chainIdError) return;
      identifyUser(account);
      // check to see if the account already exists (i.e. switching back to one that was already added)
      // before adding it
      const maker = await getMaker();
      const accounts = maker.listAccounts();
      if (accounts.some(a => a.address.toLowerCase() === account.toLowerCase())) {
        maker.useAccountWithAddress(account);
      } else {
        const notFirst = maker.service('accounts').hasAccount();
        await maker.addAccount({ type: 'web3-react', library, address: account });
        if (notFirst) {
          // if we're adding an account but it's not the first one, we have to explicitly use it;
          // otherwise "accounts/CHANGE" event listeners won't fire (e.g. looking up proxy status).
          // you can test this by connecting with metamask, and then switching the account in the
          // metamask extension UI.
          maker.useAccountWithAddress(account);
        }
      }
    })();
  }, [library, account]);
};
