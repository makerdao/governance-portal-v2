import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import {
  Connection,
  gnosisSafeConnection,
  injectedConnection,
  networkConnection
} from 'modules/web3/connections';
import { getConnectionName } from 'modules/web3/connections/utils';
import useEagerlyConnect from 'modules/web3/hooks/useEagerlyConnect';
import { ReactNode, useMemo } from 'react';

export function Web3Provider({ children }: { children: ReactNode }): React.ReactElement {
  useEagerlyConnect();
  const connections = [gnosisSafeConnection, injectedConnection, networkConnection];
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [
    connector,
    hooks
  ]);

  const key = useMemo(
    () => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'),
    [connections]
  );

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  );
}
