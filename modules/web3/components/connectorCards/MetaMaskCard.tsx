import { useEffect, useState } from 'react';
import { ConnectorCard } from './ConnectorCard';
import { injectedConnection } from 'modules/web3/connections';
import { SupportedConnector } from 'modules/web3/constants/connectors';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } =
  injectedConnection.hooks;

export default function MetaMaskCard(): JSX.Element {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState<any>(undefined);

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (injectedConnection.connector.connectEagerly) {
      void injectedConnection.connector.connectEagerly();
    }
  }, []);

  return (
    <ConnectorCard
      connector={injectedConnection.connector as SupportedConnector}
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
