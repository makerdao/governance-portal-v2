/** @jsx jsx */
import { Button, Flex, Divider, Card, Text, jsx } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';

import getMaker, { networkToRpc } from '../lib/maker';
import { useEffect } from 'react';
import { MenuButton, MenuList, MenuItem, Menu } from '@reach/menu-button';
import { SupportedNetworks } from '../lib/constants';

const formatAddress = (address: string) => address.slice(0, 7) + '...' + address.slice(-4);

const POLLING_INTERVAL = 12000;

const connectors: Array<[string, AbstractConnector]> = [
  ['MetaMask', new InjectedConnector({ supportedChainIds: [1, 42] })],
  [
    'WalletConnect',
    new WalletConnectConnector({
      rpc: { 1: networkToRpc(SupportedNetworks.MAINNET) },
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      pollingInterval: POLLING_INTERVAL
    })
  ]
];

const WrappedAccountSelect = () => (
  <Web3ReactProvider getLibrary={(provider, connector) => ({ provider, connector })}>
    <AccountSelect />
  </Web3ReactProvider>
);

const AccountSelect = () => {
  const web3ReactContext = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
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

  return (
    <Menu>
      <MenuButton sx={{ variant: 'buttons.card' }}>
        {account ? (
          <Flex sx={{ flexDirection: 'column' }}>
            <Flex sx={{ justifyContent: 'space-between' }}>
              <span>MetaMask</span>
              <span>{formatAddress(account)}</span>
            </Flex>
            <Divider mx={-2} />
            <Flex sx={{ justifyContent: 'space-between' }}>
              <span>Polling Balance</span>
              <span>333 MKR</span>
            </Flex>
          </Flex>
        ) : (
          <>Connect wallet</>
        )}
      </MenuButton>
      <MenuList sx={{ variant: 'cards.primary', p: 0 }}>
        {connectors.map(([name, connector]) => (
          <MenuItem key={name} onSelect={() => activate(connector)}>{name}</MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default WrappedAccountSelect;
