import React, { useEffect, useState, useContext } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Box, Flex, Text, Button, Close, ThemeUICSSObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import useTransactionStore from 'modules/web3/stores/transactions';
import { fadeIn, slideUp } from 'lib/keyframes';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import VotingWeight from './VotingWeight';
import ConnectWalletButton from 'modules/web3/components/ConnectWalletButton';
import { NetworkAlertModal, ChainIdError } from 'modules/web3/components/NetworkAlertModal';
import { useWeb3React } from '@web3-react/core';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useRouter } from 'next/router';
import { isAndroid, isIOS } from 'react-device-detect';
import { SUPPORTED_WALLETS, WalletName, ConnectionType } from 'modules/web3/constants/wallets';
import { connectorToWalletName, getConnection } from 'modules/web3/connections';
import { AnalyticsContext } from 'modules/app/client/analytics/AnalyticsContext';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import { getIsMetaMask } from 'modules/web3/helpers/getIsMetaMask';
import logger from 'lib/logger';
import useSelectedConnectionStore from 'modules/app/stores/selectedConnection';

const closeButtonStyle: ThemeUICSSObject = {
  height: 4,
  width: 4,
  p: 0,
  position: 'relative',
  top: '-4px',
  left: '8px'
};

const AccountSelect = (): React.ReactElement => {
  const { setUserData } = useContext(AnalyticsContext);
  const router = useRouter();
  const { account: address, connector, chainId } = useWeb3React();

  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [accountName, setAccountName] = useState<WalletName>();
  const [changeWallet, setChangeWallet] = useState(false);
  const [chainIdError, setChainIdError] = useState<ChainIdError>(null);
  const setSelectedConnection = useSelectedConnectionStore(state => state.setSelectedConnection);

  const close = () => {
    setShowDialog(false);
    setError(null);
  };

  // Handles UI state for loading
  const [loadingConnectors, setLoadingConnectors] = useState({});
  const [error, setError] = useState<string | null>(null);

  const handleError = e => {
    logger.error(e);
    let message = '';
    if (e.toString().includes('NoSafeContext') || e.toString().includes('safe context')) {
      message = 'Please try connecting from within the Gnosis Safe app.';
    } else {
      message = 'Something went wrong. Select an option to connect.';
    }
    setError(message);
  };

  // Handles the logic when clicking on a connector
  const onClickConnection = async (connectionType: ConnectionType, name: WalletName) => {
    const connection = getConnection(connectionType);
    setError(null);
    try {
      setLoadingConnectors({
        [name]: true
      });

      await connection.connector.activate();

      setSelectedConnection(connection.type);

      if (chainId) {
        setUserData({ wallet: name });
      }

      setChangeWallet(false);

      setLoadingConnectors({
        [name]: false
      });
    } catch (e) {
      handleError(e);
      setLoadingConnectors({
        [name]: false
      });
    }
  };

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

  const bpi = useBreakpointIndex();
  const isMetaMask = getIsMetaMask();

  const disconnect = () => {
    setError(null);
    if (connector?.deactivate) {
      void connector.deactivate();
    } else {
      void connector.resetState();
    }
  };

  const walletOptions = Object.keys(SUPPORTED_WALLETS).map((connectionName: WalletName, index) => (
    <Flex
      key={connectionName}
      sx={{ alignItems: 'center', justifyContent: 'space-between', mt: index !== 0 ? 3 : 0 }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Icon name={SUPPORTED_WALLETS[connectionName].name} />
        <Text sx={{ ml: 3 }}>{SUPPORTED_WALLETS[connectionName].name}</Text>
      </Flex>
      <Button
        sx={{ minWidth: '120px' }}
        variant="mutedOutline"
        key={connectionName}
        onClick={
          (isAndroid || isIOS) && !isMetaMask && SUPPORTED_WALLETS[connectionName].deeplinkUri
            ? () => window.location.replace(SUPPORTED_WALLETS[connectionName].deeplinkUri || '')
            : () => onClickConnection(SUPPORTED_WALLETS[connectionName].connectionType, connectionName)
        }
      >
        {loadingConnectors[connectionName] ? 'Loading...' : 'Select'}
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

  useEffect(() => {
    if (connector) {
      setAccountName(connectorToWalletName(connector));
    }
  }, [address]);

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
        <DialogContent
          aria-label="Change Wallet"
          sx={
            bpi === 0
              ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
              : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: '450px' }
          }
        >
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
                      accountName={accountName}
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
