/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';

import { getLibrary, connectors } from '../lib/maker/web3react';
import { syncMakerAccount } from '../lib/maker/web3react/hooks';
import { MenuButton, MenuList, MenuItem, Menu } from '@reach/menu-button';
import { formatAddress } from '../lib/utils';

const WrappedAccountSelect = () => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const web3ReactContext = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(library, account);

  return (
    <Menu>
      <MenuButton
        sx={{ variant: 'buttons.card', borderRadius: 'round', height: '36px', px: [2, 3] }}
        {...props}
      >
        {account ? <span>{formatAddress(account)}</span> : <span>Connect wallet</span>}
      </MenuButton>
      <MenuList
        sx={theme => ({
          variant: 'cards.primary',
          p: [0, 0],
          zIndex: theme.layout.modal.zIndex + 1, // otherwise will be hidden behind mobile menu
          position: 'relative'
        })}
      >
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
