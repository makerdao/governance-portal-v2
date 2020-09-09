/** @jsx jsx */

import React from 'react';
import { jsx, Box, Flex, Text, Spinner, Button, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { useWeb3React, Web3ReactProvider } from '@web3-react/core';

import { getLibrary, connectors } from '../../lib/maker/web3react';
import { syncMakerAccount } from '../../lib/maker/web3react/hooks';
import { formatAddress } from '../../lib/utils';
import useTransactionStore from '../../stores/transactions';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { AbstractConnector } from '@web3-react/abstract-connector';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import AccountIcon from './AccountIcon';

const WrappedAccountSelect = (props): JSX.Element => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect {...props} />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const web3ReactContext = useWeb3React();
  const { library, account, activate, deactivate, connector } = web3ReactContext;

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(library, account);
  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = React.useState(false);
  const [accountName, setAccountName] = React.useState('');
  const [selectedConnector, setSelectedConnector] = React.useState<AbstractConnector | undefined>(undefined);
  const [changeWallet, setChangeWallet] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();
  const walletOptions = connectors.map(([name, connector]) => (
    <Flex
      sx={{
        width: '100%',
        py: 3,
        px: 3,
        border: '1px solid #D4D9E1',
        borderRadius: 'medium',
        mb: 2,
        flexDirection: 'row',
        alignItems: 'center'
      }}
      key={name}
      onClick={() => {
        setAccountName(name);
        setSelectedConnector(connector);
        setChangeWallet(false);
        activate(connector);
      }}
    >
      <Icon name={name} />
      <Text sx={{ ml: 3 }}>{name}</Text>
    </Flex>
  ));
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
          alignSelf: 'flex-end',
          '&:hover': {
            color: 'white'
          }
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
        {changeWallet ? (
          <DialogContent
            aria-label="Change Wallet"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile' }
                : { boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '450px', borderRadius: '8px' }
            }
          >
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button variant="textual" color="primary" onClick={() => setChangeWallet(false)}>
                Back
              </Button>
              <Close aria-label="close" sx={{ height: '18px', width: '18px', p: 0 }} onClick={close} />
            </Flex>
            {walletOptions}
          </DialogContent>
        ) : (
          <DialogContent
            aria-label="Wallet Info"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile' }
                : { boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '450px', borderRadius: '8px' }
            }
          >
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 3 }}>
              <Text sx={{ fontSize: '20', color: 'onBackgroundAlt' }}>
                {account ? 'Accounts' : 'Select a Wallet'}
              </Text>
              <Close aria-label="close" sx={{ height: '18px', width: '18px', p: 0 }} onClick={close} />
            </Flex>
            {!account && <Flex sx={{ flexDirection: 'column' }}>{walletOptions}</Flex>}
            {account && (
              <AccountBox
                account={account}
                accountName={accountName}
                // This needs to be the change function for the wallet select dropdown
                change={() => {
                  console.log('changed');
                  setChangeWallet(true);
                }}
              />
            )}
            {account && txs?.length > 0 && <TransactionBox txs={txs} />}
            {account && (
              <>
                <Button
                  variant="primaryOutline"
                  color="primary"
                  sx={{ width: '100%', textAlign: 'center', borderRadius: 'small', py: 3, mt: 4 }}
                  onClick={close}
                >
                  Close
                </Button>
                {/*
              <Button
                variant="outline"
                sx={{
                  width: '100%',
                  my: 3,
                  py: 3,
                  px: 3,
                  border: '1px solid #D4D9E1',
                  borderRadius: 'medium'
                }}
                onClick={() => deactivate()}
              >
                Disconnect wallet
              </Button> */}
              </>
            )}
          </DialogContent>
        )}
      </DialogOverlay>
    </Box>
  );
};

export default WrappedAccountSelect;
