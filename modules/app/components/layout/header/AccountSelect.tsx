/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, Button, Close, ThemeUICSSObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useTransactionStore from 'modules/web3/stores/transactions';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import VotingWeight from './VotingWeight';
import ConnectWalletButton from 'modules/web3/components/ConnectWalletButton';
import { NetworkAlertModal, ChainIdError } from 'modules/web3/components/NetworkAlertModal';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useRouter } from 'next/router';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { DialogContent, DialogOverlay } from '../../Dialog';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { SupportedConnectors } from 'modules/web3/constants/networks';

const closeButtonStyle: ThemeUICSSObject = {
  height: 4,
  width: 4,
  p: 0,
  position: 'relative',
  top: '-4px',
  left: '8px'
};

const AccountSelect = (): React.ReactElement => {
  const router = useRouter();
  const { connectors, connect } = useConnect({
    mutation: {
      onSuccess: () => {
        close();
      },
      onError: (e, { connector }) => {
        logger.error(e);
        let message = '';

        if ('id' in connector && e.toString().includes('ProviderNotFoundError') && connector.id === 'safe') {
          message = 'Please try connecting from within the Safe{Wallet} app.';
        } else {
          message = 'Something went wrong. Select an option to connect.';
        }

        setError(message);
      }
    }
  });

  const { disconnect } = useDisconnect();
  const { address, connector: connectedConnector, chainId } = useAccount();

  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [changeWallet, setChangeWallet] = useState(false);
  const [chainIdError, setChainIdError] = useState<ChainIdError>(null);

  const close = () => {
    setShowDialog(false);
    setError(null);
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowDialog(false);
  }, [router.pathname]);

  useEffect(() => {
    const unsupportedNetwork = chainId && !isSupportedChain(chainId);
    if (unsupportedNetwork) {
      setChainIdError('unsupported network');
    } else {
      setChainIdError(null);
    }
  }, [chainId]);

  const walletOptions = connectors.map((connector, index) => (
    <Flex
      key={connector.id}
      sx={{ alignItems: 'center', justifyContent: 'space-between', mt: index !== 0 ? 3 : 0 }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Icon
          name={connector.id === 'safe' ? SupportedConnectors.GNOSIS_SAFE : connector.name}
          color="text"
        />
        <Text sx={{ ml: 3 }}>{connector.name}</Text>
      </Flex>
      <Button
        sx={{ minWidth: '120px' }}
        variant="mutedOutline"
        key={connector.id}
        onClick={() => connect({ connector })}
      >
        Select
      </Button>
    </Flex>
  ));

  const BackButton = ({ onClick }) => (
    <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Button variant="textual" color="primary" sx={{ fontSize: 3, px: 0 }} onClick={onClick}>
        <Icon name="chevron_left" color="primary" size="10px" mr="2" />
        Back
      </Button>
      <Close sx={closeButtonStyle} aria-label="close" onClick={close} />
    </Flex>
  );

  return (
    <Box sx={{ ml: ['auto', 3, 0] }}>
      <NetworkAlertModal chainIdError={chainIdError} deactivate={disconnect} />
      <ConnectWalletButton
        onClickConnect={() => {
          setShowDialog(true);
        }}
        address={address}
        pending={pending}
      />

      <DialogOverlay isOpen={showDialog} onDismiss={close}>
        <DialogContent ariaLabel="Change Wallet">
          {changeWallet ? (
            <>
              <BackButton onClick={() => setChangeWallet(false)} />
              {walletOptions}
              {error && (
                <Text sx={{ mt: 3 }} variant="error">
                  {error}
                </Text>
              )}
            </>
          ) : (
            <>
              <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 3, mt: 1 }}>
                <Text variant="microHeading">{address ? 'Account' : 'Select a Wallet'}</Text>
                <Close aria-label="close" sx={closeButtonStyle} onClick={close} />
              </Flex>
              {address ? (
                <>
                  <ErrorBoundary componentName="Account Details">
                    <AccountBox
                      address={address}
                      accountName={connectedConnector?.name}
                      change={() => setChangeWallet(true)}
                      disconnect={disconnect}
                    />
                  </ErrorBoundary>
                  <Box sx={{ borderBottom: '1px solid secondaryMuted', py: 1 }}>
                    <ErrorBoundary componentName="Voting Weight">
                      <VotingWeight />
                    </ErrorBoundary>
                  </Box>
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
                <Flex sx={{ flexDirection: 'column' }}>
                  {walletOptions}
                  {error && (
                    <Text sx={{ mt: 3 }} variant="error">
                      {error}
                    </Text>
                  )}
                </Flex>
              )}
            </>
          )}
        </DialogContent>
      </DialogOverlay>
    </Box>
  );
};

export default AccountSelect;
