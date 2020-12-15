/** @jsx jsx */

import React, { useEffect, useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { jsx, Box, Flex, Text, Spinner, Button, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import mixpanel from 'mixpanel-browser';

import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useWeb3React, Web3ReactProvider, UnsupportedChainIdError } from '@web3-react/core';

import getMaker, { getNetwork, chainIdToNetworkName } from '../../lib/maker';
import { getLibrary, connectors, ConnectorName } from '../../lib/maker/web3react';
import { syncMakerAccount, useEagerConnect } from '../../lib/maker/web3react/hooks';
import { formatAddress } from '../../lib/utils';
import useTransactionStore from '../../stores/transactions';
import { fadeIn, slideUp } from '../../lib/keyframes';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import AccountIcon from './AccountIcon';
import VotingWeight from './VotingWeight';
import NetworkAlertModal from './NetworkAlertModal';
import useAccountsStore from '../../stores/accounts';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

const WrappedAccountSelect = (props): JSX.Element => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect {...props} />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const { library, account: w3rAddress, activate, connector, error, chainId } = useWeb3React();
  const account2 = useAccountsStore(state => state.currentAccount);
  const address = account2?.address || w3rAddress;

  const triedEager = useEagerConnect();
  const [chainIdError, setChainIdError] = useState<ChainIdError>(null);
  const [disconnectAccount] = useAccountsStore(state => [state.disconnectAccount]);

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) setChainIdError('unsupported network');
    if (chainId !== undefined && chainIdToNetworkName(chainId) !== getNetwork())
      setChainIdError('network mismatch');
  }, [chainId, error]);

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(
    library,
    w3rAddress,
    chainId !== undefined && chainIdToNetworkName(chainId) !== getNetwork()
  );
  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = React.useState(false);
  const [accountName, setAccountName] = React.useState<ConnectorName>();
  const [changeWallet, setChangeWallet] = React.useState(false);
  const [addresses, setAddresses] = React.useState<string[]>([]);

  const [ledgerAccountScreen, setLedgerAccountScreen] = React.useState(false);
  const [ledgerSelectCallback, setLedgerSelectCallback] = React.useState<
    (err: Error | null, address?: string) => void
  >();

  const [trezorAccountScreen, setTrezorAccountScreen] = React.useState(false);
  const [trezorSelectCallback, setTrezorSelectCallback] = React.useState<
    (err: Error | null, address?: string) => void
  >();

  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  const addLedgerAccount = async address => {
    const maker = await getMaker();
    const accounts = maker.listAccounts();
    if (accounts.some(a => a.address.toLowerCase() === address.toLowerCase())) {
      maker.useAccountWithAddress(address);
      ledgerSelectCallback && ledgerSelectCallback(new Error('already added'));
    } else {
      ledgerSelectCallback && ledgerSelectCallback(null, address);
      const notFirst = maker.service('accounts').hasAccount();
      if (notFirst) {
        // if we're adding an account but it's not the first one, we have to explicitly use it;
        // otherwise "accounts/CHANGE" event listeners won't fire (e.g. looking up proxy status).
        // you can test this by connecting with metamask, and then switching the account in the
        // metamask extension UI.
        maker.useAccountWithAddress(address);
      }
    }
  };

  const addTrezorAccount = async address => {
    const maker = await getMaker();
    const accounts = maker.listAccounts();
    console.log(trezorSelectCallback, 'trezorSelectCallback');
    if (accounts.some(a => a.address.toLowerCase() === address.toLowerCase())) {
      maker.useAccountWithAddress(address);
      trezorSelectCallback && trezorSelectCallback(new Error('already added'));
    } else {
      trezorSelectCallback && trezorSelectCallback(null, address);
      const notFirst = maker.service('accounts').hasAccount();
      if (notFirst) {
        setTimeout(() => maker.useAccountWithAddress(address));
      }
    }
  };

  const ConnectWalletButton = ({ open, account, pending, ...props }) => (
    <Button
      aria-label="Connect wallet"
      sx={{
        variant: 'buttons.card',
        borderRadius: 'round',
        color: 'textSecondary',
        px: [2, 3],
        py: 2,
        alignSelf: 'flex-end',
        '&:hover': {
          color: 'text',
          borderColor: 'onSecondary',
          backgroundColor: 'white'
        }
      }}
      {...props}
      onClick={open}
    >
      {address ? (
        pending ? (
          <Flex sx={{ display: 'inline-flex' }}>
            <Spinner
              size={16}
              sx={{
                color: 'mutedOrange',
                alignSelf: 'center',
                mr: 2
              }}
            />
            <Text sx={{ color: 'mutedOrange' }}>TX Pending</Text>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center', mr: 2 }}>
            <AccountIcon account={address} sx={{ mr: 2 }} />
            <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
          </Flex>
        )
      ) : (
        <Box mx={2}>Connect wallet</Box>
      )}
    </Button>
  );

  const walletOptions = connectors.map(([name, connector]) => (
    <Flex
      sx={{
        cursor: triedEager ? 'pointer' : 'unset',
        width: '100%',
        p: 3,
        border: '1px solid',
        borderColor: 'secondaryMuted',
        borderRadius: 'medium',
        mb: 2,
        flexDirection: 'row',
        alignItems: 'center',
        '&:hover': {
          color: 'text',
          // borderColor: 'onSecondary',
          backgroundColor: 'background'
        }
      }}
      key={name}
      onClick={() => {
        activate(connector).then(() => {
          if (chainId) mixpanel.people.set({ wallet: name });
          setAccountName(name);
          setChangeWallet(false);
        });
      }}
    >
      <Icon name={name} />
      <Text sx={{ ml: 3 }}>{name}</Text>
    </Flex>
  ));

  const LedgerButton = () => (
    <Flex
      sx={{
        cursor: 'pointer',
        width: '100%',
        p: 3,
        border: '1px solid',
        borderColor: 'secondaryMuted',
        borderRadius: 'medium',
        mb: 2,
        flexDirection: 'row',
        alignItems: 'center',
        '&:hover': {
          color: 'text',
          backgroundColor: 'background'
        }
      }}
      onClick={async () => {
        const maker = await getMaker();

        try {
          await maker.addAccount({
            type: 'ledger',
            accountsLength: 10,
            choose: (addresses, callback) => {
              setAddresses(addresses);
              setLedgerAccountScreen(true);
              setLedgerSelectCallback(() => callback);

              // show the list of addresses in your UI and have the user pick one; then
              // call the callback with the chosen address. `addAccount` will not resolve
              // until the callback is called. if you pass an error object as the first
              // argument, `addAccount` will throw it.
              // setTimeout(() => callback(null, addresses[7]), 20000);
            }
          });
        } catch (err) {
          if (err.message !== 'already added') {
            throw err;
          }
        }
        if (chainId) mixpanel.people.set({ wallet: name });
        setAccountName('Ledger');
        setChangeWallet(false);
        setLedgerAccountScreen(false);
        close();
      }}
    >
      <Icon name={'Ledger'} />
      <Text sx={{ ml: 3 }}>Ledger</Text>
    </Flex>
  );

  const TrezorButton = () => (
    <Flex
      sx={{
        cursor: 'pointer',
        width: '100%',
        p: 3,
        border: '1px solid',
        borderColor: 'secondaryMuted',
        borderRadius: 'medium',
        mb: 2,
        flexDirection: 'row',
        alignItems: 'center',
        '&:hover': {
          color: 'text',
          backgroundColor: 'background'
        }
      }}
      onClick={async () => {
        const maker = await getMaker();

        try {
          await maker.addAccount({
            type: 'trezor',
            accountsLength: 10,
            accountsOffset: 0,
            path: "44'/60'/0'/0/0",
            choose: (addresses, callback) => {
              setAddresses(addresses);
              setTrezorAccountScreen(true);
              setTrezorSelectCallback(() => callback);
            }
          });
        } catch (err) {
          if (err.message !== 'already added') {
            throw err;
          }
        }

        if (chainId) mixpanel.people.set({ wallet: name });
        setAccountName('Trezor');
        setChangeWallet(false);
        close();
      }}
    >
      <Icon name={'Trezor'} />
      <Text sx={{ ml: 3 }}>Trezor</Text>
    </Flex>
  );

  const BackButton = () => (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Button
        variant="textual"
        color="primary"
        sx={{ fontSize: 3, px: 0 }}
        onClick={() => setLedgerAccountScreen(false)}
      >
        <Icon name="chevron_left" color="primary" size="10px" mr="2" />
        Back
      </Button>
      <Close
        aria-label="close"
        onClick={() => {
          close();
          setLedgerAccountScreen(false);
        }}
      />
    </Flex>
  );
  return (
    <Box>
      <NetworkAlertModal
        chainIdError={chainIdError}
        walletChainName={chainId ? chainIdToNetworkName(chainId) : null}
      />
      <ConnectWalletButton open={open} account={address} pending={pending} {...props} />
      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        {ledgerAccountScreen ? (
          <DialogContent
            aria-label="Change Wallet"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
            }
          >
            <BackButton />
            {addresses.map(address => (
              <Flex
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  p: 3,
                  border: '1px solid',
                  borderColor: 'secondaryMuted',
                  borderRadius: 'medium',
                  mb: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'text',
                    backgroundColor: 'background'
                  }
                }}
                key={address}
                onClick={() => addLedgerAccount(address)}
              >
                <Text sx={{ ml: 3 }}>{formatAddress(address)}</Text>
              </Flex>
            ))}
          </DialogContent>
        ) : trezorAccountScreen ? (
          <DialogContent
            aria-label="Change Wallet"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
            }
          >
            <BackButton />
            {addresses.map(address => (
              <Flex
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  p: 3,
                  border: '1px solid',
                  borderColor: 'secondaryMuted',
                  borderRadius: 'medium',
                  mb: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'text',
                    backgroundColor: 'background'
                  }
                }}
                key={address}
                onClick={() => addTrezorAccount(address)}
              >
                <Text sx={{ ml: 3 }}>{formatAddress(address)}</Text>
              </Flex>
            ))}
          </DialogContent>
        ) : changeWallet ? (
          <DialogContent
            aria-label="Change Wallet"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
            }
          >
            <BackButton />
            {walletOptions}
            <TrezorButton />
            <LedgerButton />
            {accountName === 'WalletConnect' && (
              <Flex
                onClick={() => {
                  (connector as WalletConnectConnector).walletConnectProvider.disconnect();
                  disconnectAccount();
                  setAccountName(undefined);
                  close();
                }}
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  p: 3,
                  border: '1px solid',
                  borderColor: 'secondaryMuted',
                  borderRadius: 'medium',
                  mb: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'text',
                    // borderColor: 'onSecondary',
                    backgroundColor: 'background'
                  }
                }}
              >
                Disconnect
              </Flex>
            )}
          </DialogContent>
        ) : (
          <DialogContent
            aria-label="Wallet Info"
            sx={
              bpi === 0
                ? {
                    variant: 'dialog.mobile',
                    animation: `${slideUp} 350ms ease`
                  }
                : {
                    variant: 'dialog.desktop',
                    animation: `${fadeIn} 350ms ease`,
                    width: '450px'
                  }
            }
          >
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 3 }}>
              <Text variant="microHeading" color="onBackgroundAlt">
                {address ? 'Account' : 'Select a Wallet'}
              </Text>
              <Close
                aria-label="close"
                sx={{
                  height: 4,
                  width: 4,
                  p: 0,
                  position: 'relative',
                  top: '-4px',
                  left: '8px'
                }}
                onClick={close}
              />
            </Flex>
            {!address && (
              <Flex sx={{ flexDirection: 'column' }}>
                {walletOptions}
                <LedgerButton />
              </Flex>
            )}
            {address && (
              <AccountBox
                {...{ account: address, accountName }}
                // This needs to be the change function for the wallet select dropdown
                change={() => setChangeWallet(true)}
              />
            )}
            {address && <VotingWeight sx={{ borderBottom: '1px solid secondaryMuted', py: 1 }} />}
            {address && txs?.length > 0 && <TransactionBox txs={txs} />}
            {address && (
              <Button
                variant="primaryOutline"
                onClick={close}
                sx={{ display: ['block', 'none'], width: '100%', mt: 4, mb: 2, py: 3 }}
              >
                Close
              </Button>
            )}
          </DialogContent>
        )}
      </DialogOverlay>
    </Box>
  );
};

export default WrappedAccountSelect;
