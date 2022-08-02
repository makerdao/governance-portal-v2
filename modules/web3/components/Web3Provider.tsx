import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import {
  coinbaseWalletConnection,
  gnosisSafeConnection,
  injectedConnection,
  networkConnection,
  walletConnectConnection
} from 'modules/web3/connections';
import useEagerlyConnect from 'modules/web3/hooks/useEagerlyConnect';
import { ReactNode } from 'react';

export function Web3Provider({ children }: { children: ReactNode }): React.ReactElement {
  useEagerlyConnect();
  const connections = [
    gnosisSafeConnection,
    injectedConnection,
    networkConnection,
    coinbaseWalletConnection,
    walletConnectConnection
  ];
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [
    connector,
    hooks
  ]);

  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>;
}