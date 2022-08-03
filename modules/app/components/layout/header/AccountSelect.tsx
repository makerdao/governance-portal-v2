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
import { useAccount } from 'modules/app/hooks/useAccount';
import { useMKRVotingWeight } from 'modules/mkr/hooks/useMKRVotingWeight';
import { formatValue } from 'lib/string';
import ConnectWalletButton from 'modules/web3/components/ConnectWalletButton';
import { NetworkAlertModal, ChainIdError } from 'modules/web3/components/NetworkAlertModal';
import { ConnectionName } from 'modules/web3/connections';
import { useWeb3React } from '@web3-react/core';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useRouter } from 'next/router';
import { InternalLink } from 'modules/app/components/InternalLink';
import { isAndroid, isIOS } from 'react-device-detect';
import { getExecutiveVotingWeightCopy } from 'modules/polling/helpers/getExecutiveVotingWeightCopy';
import { SUPPORTED_WALLETS } from 'modules/web3/constants/wallets';
import { Connection } from 'modules/web3/connections';
import { AnalyticsContext } from 'modules/app/client/analytics/AnalyticsContext';
import { isSupportedChain } from 'modules/web3/helpers/chain';
import logger from 'lib/logger';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

const walletButtonStyle: ThemeUICSSObject = {
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

  const { account: address, connector, chainId, isActive, isActivating } = useWeb3React();

  const [pending, txs] = useTransactionStore(state => [
    state.transactions.findIndex(tx => tx.status === 'pending') > -1,
    state.transactions
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [accountName, setAccountName] = useState<ConnectionName>();
  const [changeWallet, setChangeWallet] = useState(false);
  const [chainIdError, setChainIdError] = useState<ChainIdError>(null);
  const { account, voteDelegateContractAddress } = useAccount();
  const { data: votingWeight } = useMKRVotingWeight(account);

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
    if (e.toString().includes('NoSafeContext')) {
      message = 'Please try connecting from within the Gnosis Safe app.';
    } else {
      message = 'Something went wrong. Select an option to connect.';
    }
    setError(message);
  };

  console.log({ connector, address, isActive, isActivating });
  // Handles the logic when clicking on a connector
  const onClickConnection = async (connection: Connection, name: ConnectionName) => {
    setError(null);
    try {
      setLoadingConnectors({
        [name]: true
      });

      await connection.connector.activate();

      if (chainId) {
        setUserData({ wallet: name });
      }

      setAccountName(name);
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
    let error = null;
    if (isSupportedChain(chainId)) {
      if (!error) setChainIdError(null);
    } else {
      setChainIdError('unsupported network');
    }
  }, [chainId]);

  const bpi = useBreakpointIndex();

  const disconnect = () => {
    setError(null);
    if (connector?.deactivate) {
      void connector.deactivate();
    } else {
      void connector.resetState();
    }
  };

  const walletOptions = Object.keys(SUPPORTED_WALLETS).map((connectionName: ConnectionName) => (
    <Flex
      sx={walletButtonStyle}
      key={connectionName}
      onClick={
        (isAndroid || isIOS) && SUPPORTED_WALLETS[connectionName].deeplinkUri
          ? () => window.location.replace(SUPPORTED_WALLETS[connectionName].deeplinkUri)
          : () => onClickConnection(SUPPORTED_WALLETS[connectionName].connection, connectionName)
      }
    >
      <Icon name={SUPPORTED_WALLETS[connectionName].name} />
      <Text sx={{ ml: 3 }}>
        {loadingConnectors[connectionName] ? 'Loading...' : SUPPORTED_WALLETS[connectionName].name}
      </Text>
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
                <Text sx={{ mt: 2 }} variant="error">
                  {error}
                </Text>
              )}
            </>
          ) : (
            <>
              <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', mb: 3 }}>
                <Text variant="microHeading" color="onBackgroundAlt">
                  {address ? 'Account' : 'Select a Wallet'}
                </Text>
                <Close aria-label="close" sx={closeButtonStyle} onClick={close} />
              </Flex>
              {address ? (
                <>
                  <ErrorBoundary componentName="Account Details">
                    <AccountBox
                      {...{ address, accountName }}
                      // This needs to be the change function for the wallet select dropdown
                      change={() => setChangeWallet(true)}
                      disconnect={disconnect}
                    />
                  </ErrorBoundary>
                  <Box sx={{ borderBottom: '1px solid secondaryMuted', py: 1 }}>
                    <ErrorBoundary componentName="Voting Weight">
                      <VotingWeight />
                      <Flex sx={{ justifyContent: 'space-between' }}>
                        <Text
                          color="textSecondary"
                          variant="caps"
                          sx={{ pt: 4, fontSize: 1, fontWeight: '600' }}
                        >
                          executive voting weight
                        </Text>
                      </Flex>
                      <Flex>
                        <Text sx={{ fontSize: 5 }}>
                          {votingWeight ? `${formatValue(votingWeight.chiefTotal)} MKR` : '--'}
                        </Text>
                      </Flex>
                      <Flex sx={{ py: 1 }}>
                        <Text sx={{ fontSize: 2 }} color="textSecondary">
                          {getExecutiveVotingWeightCopy(!!voteDelegateContractAddress)}
                        </Text>
                      </Flex>
                    </ErrorBoundary>
                    <Box sx={{ mt: 3 }}>
                      <InternalLink
                        href={'/account'}
                        title="View account page"
                        styles={{ color: 'accentBlue' }}
                      >
                        <Text as="p">View account page</Text>
                      </InternalLink>
                    </Box>
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
                    <Text sx={{ mt: 2 }} variant="error">
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
