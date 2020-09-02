/** @jsx jsx */
import { jsx, Box, Flex, Text, Spinner } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import dynamic from 'next/dynamic';

import { getLibrary, connectors } from '../lib/maker/web3react';
import { syncMakerAccount } from '../lib/maker/web3react/hooks';
import { MenuButton, MenuList, MenuItem, Menu } from '@reach/menu-button';
import { formatAddress } from '../lib/utils';
import { useEffect, useRef } from 'react';
import useBallotStore from '../stores/ballot';
import useTransactionStore, { transactionsSelectors } from '../stores/transactions';
import shallow from 'zustand/shallow';

const WrappedAccountSelect = props => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect {...props} />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const web3ReactContext = useWeb3React();
  const { connector, library, chainId, account, activate, deactivate, active, error } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(library, account);
  const txId = useBallotStore(state => state.txId);
  const transaction = useTransactionStore(
    state => (txId ? transactionsSelectors.getTransaction(state, txId) : null),
    shallow
  );
  {
    transaction?.status === 'pending' && (
      <Spinner
        size={16}
        sx={{
          color: 'mutedOrange',
          alignSelf: 'center',
          display: transaction && transaction.status === 'pending' ? null : 'none',
          mr: 2
        }}
      />
    );
  }
  return (
    <Menu>
      <MenuButton
        aria-label="Connect wallet"
        sx={{ variant: 'buttons.card', borderRadius: 'round', height: '36px', px: [2, 3], py: 0 }}
        {...props}
      >
        {account ? (
          transaction?.status === 'pending' ? (
            <Box>
              <Spinner
                size={16}
                sx={{
                  color: 'mutedOrange',
                  alignSelf: 'center',
                  // display: transaction && transaction.status === 'pending' ? null : 'none',
                  mr: 2
                }}
              />
              <Text sx={{ color: 'mutedOrange' }}>TX Pending</Text>
            </Box>
          ) : (
            <Flex sx={{ alignItems: 'center', mr: 2 }}>
              <AccountIcon account={account} sx={{ mr: 2 }} />
              <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
            </Flex>
          )
        ) : (
          <Box mx={2}>Connect wallet</Box>
        )}
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

type AccountIconProps = { account: string };
const AccountIcon = dynamic(
  async () => {
    const { default: jazzicon } = await import('jazzicon');
    return ({ account, ...props }: AccountIconProps) => {
      const iconParent = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!account || !iconParent.current || typeof window === 'undefined') return;
        const parent: HTMLDivElement = iconParent.current;
        if (parent.firstChild) parent.removeChild(parent.firstChild);
        parent.appendChild(jazzicon(22, parseInt(account.slice(2, 10), 16)));
      }, [account]);

      return <Box {...props} ref={iconParent}></Box>;
    };
  },
  { ssr: false }
);

export default WrappedAccountSelect;
