import React, { useEffect, useState } from 'react';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Box, Flex, Text, Button, Close, ThemeUICSSObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useWeb3React, Web3ReactProvider, UnsupportedChainIdError } from '@web3-react/core';

import getMaker, { getNetwork } from 'lib/maker';
import { syncMakerAccount } from 'lib/web3react/hooks';
import { formatAddress } from 'lib/utils';
import useTransactionStore from 'modules/web3/stores/transactions';
import { fadeIn, slideUp } from 'lib/keyframes';
import AccountBox from './AccountBox';
import TransactionBox from './TransactionBox';
import VotingWeight from './VotingWeight';
import NetworkAlertModal from './NetworkAlertModal';
import useAccountsStore from 'modules/app/stores/accounts';
import { AbstractConnector } from '@web3-react/abstract-connector';
import ConnectWalletButton from 'modules/web3/components/ConnectWalletButton';
import { getLibrary } from 'modules/web3/helpers';
import { useEagerConnect } from 'modules/web3/hooks/useEagerConnect';
import { ConnectorName, SUPPORTED_WALLETS, chainIdToNetworkName } from 'modules/web3/web3.constants';
import { useContext } from 'react';
import { AnalyticsContext } from 'modules/app/client/analytics/AnalyticsContext';
import Tooltip from 'modules/app/components/Tooltip';

export type ChainIdError = null | 'network mismatch' | 'unsupported network';

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

const disabledWalletButtonStyle: ThemeUICSSObject = {
  ...walletButtonStyle,
  cursor: 'not-allowed',
  '&:hover': null
};

const closeButtonStyle: ThemeUICSSObject = {
  height: 4,
  width: 4,
  p: 0,
  position: 'relative',
  top: '-4px',
  left: '8px'
};

const disabledHardwareBlurb = (
  <>
    Hardware wallets currently only work through <br />
    their metamask integrations
  </>
);

const WrappedAccountSelect = (): JSX.Element => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <AccountSelect />
  </Web3ReactProvider>
);

const ADDRESSES_PER_PAGE = 5;
const MAX_PAGES = 5;

const AccountSelect = (): React.ReactElement => {
  const { setUserData } = useContext(AnalyticsContext);

  const { library, account: w3rAddress, activate, connector, error, chainId } = useWeb3React();
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;

  // Detect previously authorized connections and force log-in
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

  const [showDialog, setShowDialog] = useState(false);
  const [accountName, setAccountName] = useState<ConnectorName>();
  const [changeWallet, setChangeWallet] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);

  const [showHwAddressSelector, setShowHwAddressSelector] = useState(false);
  const [hwSelectCallback, setHwSelectCallback] = useState<(err: Error | null, address?: string) => void>();

  const [hwPageNum, setHwPageNum] = useState(0);

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
    const { setUserData } = useContext(AnalyticsContext);
    const [loading, setLoading] = useState(false);
    return (
      <Tooltip label={disabledHardwareBlurb}>
        <Flex
          sx={disabledWalletButtonStyle as any}
          // onClick={async () => {
          //   setLoading(true);
          //   const maker = await getMaker();

          //   try {
          //     await maker.addAccount({
          //       type: 'ledger',
          //       accountsLength: ADDRESSES_PER_PAGE * MAX_PAGES,
          //       choose: (addresses, callback) => {
          //         setLoading(false);
          //         setAddresses(addresses);
          //         setShowHwAddressSelector(true);
          //         setHwSelectCallback(() => callback);
          //       }
          //     });
          //   } catch (err) {
          //     if (err.message !== 'already added') throw err;
          //   }
          //   if (chainId) {
          //     setUserData({ wallet: 'Ledger' });
          //   }
          //   setAccountName('Ledger');
          //   setChangeWallet(false);
          //   setShowHwAddressSelector(false);
          //   close();
          // }}
        >
          <Icon name="Ledger" />
          <Text sx={{ ml: 3 }}>{loading ? 'Loading...' : 'Ledger'}</Text>
        </Flex>
      </Tooltip>
    );
  };

  const TrezorButton = () => (
    <Tooltip label={disabledHardwareBlurb}>
      <Flex
        sx={disabledWalletButtonStyle as any}
        // onClick={async () => {
        //   const maker = await getMaker();

        //   try {
        //     await maker.addAccount({
        //       type: 'trezor',
        //       accountsLength: ADDRESSES_PER_PAGE * MAX_PAGES,
        //       accountsOffset: 0,
        //       path: "44'/60'/0'/0/0",
        //       choose: (addresses, callback) => {
        //         setAddresses(addresses);
        //         setShowHwAddressSelector(true);
        //         setHwSelectCallback(() => callback);
        //       }
        //     });
        //   } catch (err) {
        //     if (err.message.match(/Popup closed/)) return;
        //     if (err.message !== 'already added') throw err;
        //   }

        //   if (chainId) {
        //     setUserData({ wallet: 'Trezor' });
        //   }
        //   setAccountName('Trezor');
        //   setChangeWallet(false);
        //   close();
        // }}
      >
        <Icon name="Trezor" />
        <Text sx={{ ml: 3 }}>Trezor</Text>
      </Flex>
    </Tooltip>
  );

  // Handles UI state for loading
  const [loadingConnectors, setLoadingConnectors] = useState({});

  // Handles the logic when clicking on a connector
  const onClickConnector = async (connector: AbstractConnector, name: ConnectorName) => {
    try {
      setLoadingConnectors({
        [name]: true
      });

      await activate(connector);

      if (chainId) {
        setUserData({ wallet: name });
      }
      setAccountName(name);
      setChangeWallet(false);

      setLoadingConnectors({
        [name]: false
      });
    } catch (e) {
      setLoadingConnectors({
        [name]: false
      });
    }
  };

  const walletOptions = Object.keys(SUPPORTED_WALLETS)
    .map((name: ConnectorName) => (
      <Flex
        sx={walletButtonStyle}
        key={name}
        onClick={() => onClickConnector(SUPPORTED_WALLETS[name].connector, name)}
      >
        <Icon name={name} />
        <Text sx={{ ml: 3 }}>{loadingConnectors[name] ? 'Loading...' : name}</Text>
      </Flex>
    ))
    .concat([<TrezorButton key="trezor" />, <LedgerButton key="ledger" />]);

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
      <NetworkAlertModal
        chainIdError={chainIdError}
        walletChainName={chainId ? chainIdToNetworkName(chainId) : null}
      />

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
          {showHwAddressSelector ? (
            <>
              <BackButton onClick={() => setShowHwAddressSelector(false)} />
              <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', pb: 3 }}>
                <Button
                  variant="mutedOutline"
                  disabled={hwPageNum === 0}
                  onClick={() => setHwPageNum(hwPageNum - 1)}
                >
                  <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Icon name="chevron_left" size={2} mr={2} />
                    Previous Page
                  </Flex>
                </Button>
                <Button
                  variant="mutedOutline"
                  disabled={hwPageNum === MAX_PAGES - 1}
                  onClick={() => setHwPageNum(hwPageNum + 1)}
                >
                  <Flex sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                    Next Page
                    <Icon name="chevron_right" size={2} ml={2} />
                  </Flex>
                </Button>
              </Flex>
              {addresses
                .slice(hwPageNum * ADDRESSES_PER_PAGE, (hwPageNum + 1) * ADDRESSES_PER_PAGE)
                .map(address => (
                  <Flex sx={walletButtonStyle} key={address} onClick={() => addHwAccount(address)}>
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
                  sx={walletButtonStyle}
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
                <Close aria-label="close" sx={closeButtonStyle} onClick={close} />
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
