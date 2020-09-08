/** @jsx jsx */
import React, { useEffect, useRef } from 'react';
import { jsx, Box, Flex, Text, Spinner, Button, Close } from 'theme-ui';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import dynamic from 'next/dynamic';

import { getLibrary, connectors } from '../lib/maker/web3react';
import { syncMakerAccount } from '../lib/maker/web3react/hooks';
import { formatAddress } from '../lib/utils';
import useTransactionStore from '../stores/transactions';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';

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
  const pending = useTransactionStore(
    state => state.transactions.findIndex(tx => tx.status === 'pending') > -1
  );

  const [showDialog, setShowDialog] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  return (
    <Box>
      <Button
        aria-label="Connect wallet"
        sx={{
          variant: 'buttons.card',
          borderRadius: 'round',
          height: '36px',
          px: [2, 3],
          py: 0,
          alignSelf: 'flex-end'
        }}
        {...props}
        onClick={open}
      >
        {account ? (
          pending ? (
            <Flex sx={{ display: 'inline-flex' }}>
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
            </Flex>
          ) : (
            <Flex sx={{ alignItems: 'center', mr: 2 }}>
              <AccountIcon account={account} sx={{ mr: 2 }} />
              <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
            </Flex>
          )
        ) : (
          <Box mx={2}>Connect wallet</Box>
        )}
      </Button>
      <DialogOverlay style={{ background: 'hsla(0, 100%, 100%, 0.9)' }} isOpen={showDialog} onDismiss={close}>
        <DialogContent
          sx={bpi === 0 ? { variant: 'dialog.mobile' } : { boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)' }}
        >
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{account ? 'Accounts' : 'Select a Wallet'}</Text>
            <Close
              aria-label="close"
              ml="3"
              sx={{ display: [null, 'none'], height: '18px', width: '18px', p: 0 }}
              onClick={close}
            />
          </Flex>
          <Flex sx={{ flexDirection: 'column' }}>
            {connectors.map(([name, connector]) => (
              <Box sx={{ width: '100%', px: 3 }} key={name} onClick={() => activate(connector)}>
                {name}
              </Box>
            ))}
          </Flex>
          <Button onClick={close}>Close</Button>
        </DialogContent>
      </DialogOverlay>
    </Box>
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
