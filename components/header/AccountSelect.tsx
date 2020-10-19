/** @jsx jsx */

import React, { useEffect, useState } from 'react';
import { jsx, Box, Flex, Text, Spinner, Button, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { useWeb3React, Web3ReactProvider, UnsupportedChainIdError } from '@web3-react/core';

import { getNetwork, chainIdToNetworkName } from '../../lib/maker';
import { getLibrary, connectors, ConnectorName } from '../../lib/maker/web3react';
import { syncMakerAccount } from '../../lib/maker/web3react/hooks';
import { formatAddress } from '../../lib/utils';
import useTransactionStore from '../../stores/transactions';
import { fadeIn, slideUp } from '../../lib/keyframes';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import AccountIcon from './AccountIcon';
import VotingWeight from './VotingWeight';
import NetworkAlertModal from './NetworkAlertModal';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

const WrappedAccountSelect = (props): JSX.Element => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect {...props} />
  </Web3ReactProvider>
);

const AccountSelect = props => {
  const { library, account, activate, connector, error, chainId } = useWeb3React();
  const [chainIdError, setChainIdError] = useState<ChainIdError>(null);

  useEffect(() => {
    if (error instanceof UnsupportedChainIdError) setChainIdError('unsupported network');
    if (chainId !== undefined && chainIdToNetworkName(chainId) !== getNetwork())
      setChainIdError('network mismatch');
  }, [chainId, error]);

  // FIXME there must be a more direct way to get web3-react & maker to talk to each other
  syncMakerAccount(library, account, chainId !== undefined && chainIdToNetworkName(chainId) !== getNetwork());
  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = React.useState(false);
  const [accountName, setAccountName] = React.useState<ConnectorName>();
  const [changeWallet, setChangeWallet] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const bpi = useBreakpointIndex();

  const walletOptions = connectors.map(([name, connector]) => (
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
          // borderColor: 'onSecondary',
          backgroundColor: 'background'
        }
      }}
      key={name}
      onClick={() => {
        activate(connector).then(() => {
          setAccountName(name);
          setChangeWallet(false);
        });
      }}
    >
      <Icon name={name} />
      <Text sx={{ ml: 3 }}>{name}</Text>
    </Flex>
  ));

  return (
    <Box>
      <NetworkAlertModal
        chainIdError={chainIdError}
        walletChainName={chainId ? chainIdToNetworkName(chainId) : null}
      />
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
        {account ? (
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
              <AccountIcon account={account} sx={{ mr: 2 }} />
              <Text sx={{ fontFamily: 'body' }}>{formatAddress(account)}</Text>
            </Flex>
          )
        ) : (
          <Box mx={2}>Connect wallet</Box>
        )}
      </Button>
      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        {changeWallet ? (
          <DialogContent
            aria-label="Change Wallet"
            sx={
              bpi === 0
                ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
                : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
            }
          >
            <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button
                variant="textual"
                color="primary"
                sx={{ fontSize: 3, px: 0 }}
                onClick={() => setChangeWallet(false)}
              >
                <Icon name="chevron_left" color="primary" size="10px" mr="2" />
                Back
              </Button>
              <Close aria-label="close" onClick={close} />
            </Flex>
            {walletOptions}
            {accountName === 'WalletConnect' && (
              <Flex
                onClick={() => (connector as WalletConnectConnector).walletConnectProvider.disconnect()}
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
                {account ? 'Account' : 'Select a Wallet'}
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
            {!account && <Flex sx={{ flexDirection: 'column' }}>{walletOptions}</Flex>}
            {account && connector && (
              <AccountBox
                {...{ account, accountName, connector }}
                // This needs to be the change function for the wallet select dropdown
                change={() => setChangeWallet(true)}
              />
            )}
            {account && <VotingWeight sx={{ borderBottom: '1px solid secondaryMuted', py: 1 }} />}
            {account && txs?.length > 0 && <TransactionBox txs={txs} />}
            {account && (
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
