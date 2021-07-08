/** @jsx jsx */

import React, { useEffect, useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { jsx, Box, Flex, Text, Spinner, Button, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import mixpanel from 'mixpanel-browser';

import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useWeb3React, Web3ReactProvider, UnsupportedChainIdError } from '@web3-react/core';

import getMaker, { getNetwork, chainIdToNetworkName } from 'lib/maker';
import { getLibrary, connectors, ConnectorName } from 'lib/maker/web3react';
import { syncMakerAccount, useEagerConnect } from 'lib/maker/web3react/hooks';
import { formatAddress } from 'lib/utils';
import useTransactionStore from 'stores/transactions';
import { fadeIn, slideUp } from 'lib/keyframes';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import AddressIcon from './AddressIcon';
import VotingWeight from './VotingWeight';
import NetworkAlertModal from './NetworkAlertModal';
import useAccountsStore from 'stores/accounts';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

const walletButtonStyle = {
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
};

const closeButtonStyle = {
  height: 4,
  width: 4,
  p: 0,
  position: 'relative',
  top: '-4px',
  left: '8px'
};

const WrappedAccountSelect = (props): JSX.Element => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect {...props} />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const { library, account: w3rAddress, activate, connector, error, chainId } = useWeb3React();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  useEagerConnect();
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

  const [showHwAddressSelector, setShowHwAddressSelector] = React.useState(false);
  const [hwSelectCallback, setHwSelectCallback] = React.useState<
    (err: Error | null, address?: string) => void
  >();

  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  const addHwAccount = async address => {
    const maker = await getMaker();
    const accounts = maker.listAccounts();
    if (accounts.some(a => a.address.toLowerCase() === address.toLowerCase())) {
      maker.useAccountWithAddress(address);
      hwSelectCallback && hwSelectCallback(new Error('already added'));
    } else {
      hwSelectCallback && hwSelectCallback(null, address);
      const notFirst = maker.service('accounts').hasAccount();
      if (notFirst) {
        // if we're adding an account but it's not the first one, we have to explicitly use it;
        // otherwise "accounts/CHANGE" event listeners won't fire (e.g. looking up proxy status).
        // you can test this by connecting with metamask, and then switching the account in the
        // metamask extension UI.
        //
        // setTimeout is necessary because we need to wait for addAccount to resolve
        setTimeout(() => maker.useAccountWithAddress(address));
      }
    }
  };

  const LedgerButton = () => {
    const [loading, setLoading] = useState(false);
    return (
      <Flex
        sx={walletButtonStyle as any}
        onClick={async () => {
          setLoading(true);
          const maker = await getMaker();

          try {
            await maker.addAccount({
              type: 'ledger',
              accountsLength: 10,
              choose: (addresses, callback) => {
                setLoading(false);
                setAddresses(addresses);
                setShowHwAddressSelector(true);
                setHwSelectCallback(() => callback);
              }
            });
          } catch (err) {
            if (err.message !== 'already added') throw err;
          }
          if (chainId) mixpanel.people.set({ wallet: name });
          setAccountName('Ledger');
          setChangeWallet(false);
          setShowHwAddressSelector(false);
          close();
        }}
      >
        <Icon name="Ledger" />
        <Text sx={{ ml: 3 }}>{loading ? 'Loading...' : 'Ledger'}</Text>
      </Flex>
    );
  };

  const TrezorButton = () => (
    <Flex
      sx={walletButtonStyle as any}
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
              setShowHwAddressSelector(true);
              setHwSelectCallback(() => callback);
            }
          });
        } catch (err) {
          if (err.message.match(/Popup closed/)) return;
          if (err.message !== 'already added') throw err;
        }

        if (chainId) mixpanel.people.set({ wallet: name });
        setAccountName('Trezor');
        setChangeWallet(false);
        close();
      }}
    >
      <Icon name="Trezor" />
      <Text sx={{ ml: 3 }}>Trezor</Text>
    </Flex>
  );

  const walletOptions = connectors
    .map(([name, connector]) => (
      <Flex
        sx={walletButtonStyle as any}
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
    ))
    .concat([<TrezorButton key="trezor" />, <LedgerButton key="ledger" />]);

  const BackButton = ({ onClick }) => (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Button variant="textual" color="primary" sx={{ fontSize: 3, px: 0 }} onClick={onClick}>
        <Icon name="chevron_left" color="primary" size="10px" mr="2" />
        Back
      </Button>
      <Close sx={closeButtonStyle as any} aria-label="close" onClick={close} />
    </Flex>
  );

  return (
    <Box>
      <NetworkAlertModal
        chainIdError={chainIdError}
        walletChainName={chainId ? chainIdToNetworkName(chainId) : null}
      />
      <ConnectWalletButton open={open} address={address} pending={pending} {...props} />
      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        <DialogContent
          aria-label="Change Wallet"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
          }
        >
          {showHwAddressSelector ? (
            <>
              <BackButton onClick={() => setShowHwAddressSelector(false)} />
              {addresses.map(address => (
                <Flex sx={walletButtonStyle as any} key={address} onClick={() => addHwAccount(address)}>
                  <Text sx={{ ml: 3 }}>{formatAddress(address)}</Text>
                </Flex>
              ))}
            </>
          ) : changeWallet ? (
            <>
              <BackButton onClick={() => setChangeWallet(false)} />
              {walletOptions}
              {accountName === 'WalletConnect' && (
                <Flex
                  onClick={() => {
                    (connector as WalletConnectConnector).walletConnectProvider.disconnect();
                    disconnectAccount();
                    setAccountName(undefined);
                    close();
                  }}
                  sx={walletButtonStyle as any}
                >
                  Disconnect
                </Flex>
              )}
            </>
          ) : (
            <>
              <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 3 }}>
                <Text variant="microHeading" color="onBackgroundAlt">
                  {address ? 'Account' : 'Select a Wallet'}
                </Text>
                <Close aria-label="close" sx={closeButtonStyle as any} onClick={close} />
              </Flex>
              {address ? (
                <>
                  <AccountBox
                    {...{ address, accountName }}
                    // This needs to be the change function for the wallet select dropdown
                    change={() => setChangeWallet(true)}
                  />
                  <VotingWeight sx={{ borderBottom: '1px solid secondaryMuted', py: 1 }} />
                  {txs?.length > 0 && <TransactionBox txs={txs} />}
                  <Button
                    variant="primaryOutline"
                    onClick={close}
                    sx={{ display: ['block', 'none'], width: '100%', mt: 4, mb: 2, py: 3 }}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <Flex sx={{ flexDirection: 'column' }}>{walletOptions}</Flex>
              )}
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </Box>
  );
};

export default WrappedAccountSelect;

const ConnectWalletButton = ({ open, address, pending, ...props }) => (
  <Button
    aria-label="Connect wallet"
    sx={{
      variant: 'buttons.card',
      borderRadius: 'round',
      color: 'textSecondary',
      p: 2,
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
          <Box sx={{ mr: 2 }}>
            <AddressIcon address={address} />
          </Box>
          <Text sx={{ fontFamily: 'body' }}>{formatAddress(address)}</Text>
        </Flex>
      )
    ) : (
      <Box mx={2}>Connect wallet</Box>
    )}
  </Button>
);
