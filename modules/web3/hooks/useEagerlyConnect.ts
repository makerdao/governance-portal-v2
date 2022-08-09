import { Connector } from '@web3-react/types';
import { useEffect } from 'react';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import { ConnectionType } from '../constants/wallets';
import logger from 'lib/logger';

export async function connect(connector: Connector, gnosis = false) {
  // gnosis web3-react package has a call, this.safe.sdk.getInfo(), that will timeout occasionally
  // this gives it more time to be able to detect the safe context
  if (gnosis) {
    await new Promise<undefined>(resolve => setTimeout(resolve, 1000));
  }
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
      connect(connection.connector, connection.type === ConnectionType.GNOSIS_SAFE);
    });
  }, []);
}
