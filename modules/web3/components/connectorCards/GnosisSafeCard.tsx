import { useEffect, useState } from 'react';
import { ConnectorCard } from './ConnectorCard';
import { gnosisSafeConnection } from 'modules/web3/connections';
import { SupportedConnector } from 'modules/web3/constants/connectors';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } =
  gnosisSafeConnection.hooks;

export default function GnosisSafeCard(): React.ReactElement {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState();

  // attempt to connect eagerly on mount
  useEffect(() => {
    if (gnosisSafeConnection.connector.connectEagerly) {
      void gnosisSafeConnection.connector.connectEagerly();
    }
  }, []);

  return (
    <ConnectorCard
      connector={gnosisSafeConnection.connector as SupportedConnector}
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
