import { useState } from 'react';
import { ConnectorCard } from './ConnectorCard';
import { SupportedConnector } from 'modules/web3/constants/connectors';

export function WalletCard({ connection, children }): JSX.Element {
  const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } =
    connection.hooks;
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState<any>(undefined);

  return (
    <ConnectorCard
      connector={connection.connector as SupportedConnector}
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
