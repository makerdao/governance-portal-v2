import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { Connection } from 'modules/web3/connections';
import { useEagerlyConnect } from 'modules/web3/hooks/useEagerlyConnect';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import { ReactNode, useMemo } from 'react';

export function Web3Provider({ children }: { children: ReactNode }): React.ReactElement {
  useEagerlyConnect();
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [
    connector,
    hooks
  ]);

  const key = useMemo(() => connections.map(({ type }: Connection) => type).join('-'), [connections]);

  return (
    <Web3ReactProvider key={key} connectors={connectors}>
      {children}
    </Web3ReactProvider>
  );
}
