import { Connector } from '@web3-react/types';
import { useEffect } from 'react';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import { ConnectionType } from '../constants/wallets';
import logger from 'lib/logger';

export async function connect(connector: Connector, retry = false) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    // sometimes gnosis safe fails to detect the safe context
    // this attempts to reconnect once more if the safe context is not detected
    if (retry) {
      connect(connector);
    }
    logger.debug(`web3-react eager connection error: ${error}`);
  }
}

export function useEagerlyConnect(): void {
  const connections = useOrderedConnections();

  useEffect(() => {
    connections.forEach(connection => {
      connect(connection.connector, connection.type === ConnectionType.GNOSIS_SAFE);
    });
  }, []);
}
