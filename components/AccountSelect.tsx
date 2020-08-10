/** @jsx jsx */
import { Flex, Divider, jsx } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';

import getMaker from '../lib/maker';
import { getLibrary, connectors } from '../lib/maker/web3react';
import { syncMakerAccount } from '../lib/maker/web3react/hooks';
import { useEffect } from 'react';
import { MenuButton, MenuList, MenuItem, Menu } from '@reach/menu-button';

const formatAddress = (address: string) => address.slice(0, 7) + '...' + address.slice(-4);

const WrappedAccountSelect = () => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect />
  </Web3ReactProvider>
);

const AccountSelect = () => {
  const web3ReactContext = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(library, account);

  return (
    <Menu>
      <MenuButton sx={{ variant: 'buttons.card' }}>
        {account ? <span>{formatAddress(account)}</span> : <span>Connect wallet</span>}
      </MenuButton>
      <MenuList sx={{ variant: 'cards.primary', p: 0 }}>
        {connectors.map(([name, connector]) => (
          <MenuItem key={name} onSelect={() => activate(connector)}>
            {name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default WrappedAccountSelect;
