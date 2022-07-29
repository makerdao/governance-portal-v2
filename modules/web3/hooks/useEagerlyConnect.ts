import { Connector } from '@web3-react/types';
import { gnosisSafeConnection, networkConnection } from 'modules/web3/connections';
import { useEffect } from 'react';

async function connect(connector: Connector) {
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
  useEffect(() => {
    connect(gnosisSafeConnection.connector);
    connect(networkConnection.connector);
  }, []);
}
