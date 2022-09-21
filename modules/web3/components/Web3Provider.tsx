import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { Connection } from 'modules/web3/types/connection';
import { connect, useEagerlyConnect } from 'modules/web3/hooks/useEagerlyConnect';
import { useOrderedConnections } from 'modules/web3/hooks/useOrderedConnections';
import React, { ReactNode, useMemo, useState } from 'react';

interface ContextProps {
  addConnector: ([Connector, Web3ReactHooks]) => void;
}

export const Web3ProviderContext = React.createContext<ContextProps>({
  addConnector: (a: any) => null
});

export function Web3Provider({ children }: { children: ReactNode }): React.ReactElement {
  useEagerlyConnect();
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [
    connector,
    hooks
  ]);

  const [manuallyAddedConnectors, setManuallyAddedConnectors] = useState<[Connector, Web3ReactHooks][]>([]);
  const [date, setDate] = useState(Date.now());
  const key = useMemo(
    () => connections.map(({ type }: Connection) => type).join('-') + date,
    [connections, manuallyAddedConnectors]
  );

  return (
    <Web3ProviderContext.Provider
      value={{
        addConnector: (a: [Connector, Web3ReactHooks]) => {
          setDate(Date.now());
          setManuallyAddedConnectors([a]);
          connect(a[0]);
        }
      }}
    >
      <Web3ReactProvider key={key} connectors={[...manuallyAddedConnectors, ...connectors]}>
        {children}
      </Web3ReactProvider>
    </Web3ProviderContext.Provider>
  );
}
