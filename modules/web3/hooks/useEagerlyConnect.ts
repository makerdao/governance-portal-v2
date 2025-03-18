/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Connector } from '@web3-react/types';
import { useEffect } from 'react';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import logger from 'lib/logger';
import { checkInjectedProvider } from '../helpers/checkInjectedProvider';

export async function connect(connector: Connector) {
  try {
    // This is needed because of this issue https://github.com/MetaMask/metamask-extension/issues/3133
    checkInjectedProvider();

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
