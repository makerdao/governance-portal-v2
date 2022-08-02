import { useEffect, useState } from 'react';
import { coinbaseWalletConnection } from 'modules/web3/connections';
import { ConnectorCard } from './ConnectorCard';
import { SupportedConnector } from 'modules/web3/constants/connectors';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } =
  coinbaseWalletConnection.hooks;

export default function CoinbaseWalletCard() {
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);

  const [error, setError] = useState(undefined);

  return (
    <ConnectorCard
      connector={coinbaseWalletConnection.connector as SupportedConnector}
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
