// import { URI_AVAILABLE } from '@web3-react/walletconnect';
import React, { useEffect, useState } from 'react';
import { walletConnectConnection } from 'modules/web3/connections';
import { ConnectorCard } from './ConnectorCard';
import { SupportedConnector } from 'modules/web3/constants/connectors';
import logger from 'lib/logger';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } =
  walletConnectConnection.hooks;

export default function WalletConnectCard(): React.ReactElement {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined);

  // TODO can we enable this?
  // log URI when available
  // useEffect(() => {
  //   walletConnect.events.on(URI_AVAILABLE, (uri: string) => {
  //     console.log(`uri: ${uri}`);
  //   });
  // }, []);

  return (
    <ConnectorCard
      connector={walletConnectConnection.connector as SupportedConnector}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  );
}
