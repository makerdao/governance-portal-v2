import { Connector } from '@web3-react/types';
import { useEffect } from 'react';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import logger from 'lib/logger';

export async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    logger.debug(`web3-react eager connection error: ${error}`);
  }
}

export function useEagerlyConnect(): void {
  const connections = useOrderedConnections();

  useEffect(() => {
    connections.forEach(connection => {
      connect(connection.connector);
    });
  }, []);
}
