import { Connector } from '@web3-react/types';
import { useEffect } from 'react';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';

export async function connect(connector: Connector) {
  console.log('eagerly connecting to...');
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

export function useEagerlyConnect(): void {
  const connections = useOrderedConnections();

  useEffect(() => {
    connections.map(connection => connection.connector).forEach(connect);
  }, []);
}
