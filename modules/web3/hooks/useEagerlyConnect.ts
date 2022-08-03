import { Connector } from '@web3-react/types';
import {
  gnosisSafeConnection,
  networkConnection,
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectConnection
} from 'modules/web3/connections';
import { useEffect } from 'react';
import { useAccount } from 'modules/app/hooks/useAccount';

export async function connect(connector: Connector) {
  console.log('connecting to..');
  console.log(connector);
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
}

export default function useEagerlyConnect(): void {
  const { selectedConnection } = useAccount();
  useEffect(() => {
    console.log({ selectedConnection });
    connect(gnosisSafeConnection.connector);
    connect(networkConnection.connector);

    if (selectedConnection) {
      connect(selectedConnection.connector);
    } else {
      [injectedConnection, coinbaseWalletConnection, walletConnectConnection]
        .map(connection => connection.connector)
        .forEach(connect);
    }
    // connect(coinbaseWalletConnection.connector);
    // connect(walletConnectConnection.connector);
    // connect(injectedConnection.connector);
  }, []);
}
