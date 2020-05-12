import React, { createContext, useState, useEffect } from 'react';
import _maker from '../lib/maker';

export const AccountsContext = createContext();

function AccountsProvider({ children, network }) {
  const [currentAccount, setCurrentAccount] = useState(null);
  useEffect(() => {
    _maker.then((maker) => {
      maker.on('accounts/CHANGE', ({ payload }) => {
        setCurrentAccount(payload.account);
      });
    });
  }, [network]);

  return (
    <AccountsContext.Provider value={{ currentAccount }}>
      {children}
    </AccountsContext.Provider>
  );
}

export default AccountsProvider;
