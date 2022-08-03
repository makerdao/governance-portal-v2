import { useMemo } from 'react';
import { Connection, orderedConnections } from 'modules/web3/connections';
import useSelectedConnectionStore from 'modules/app/stores/selectedConnection';

export function useOrderedConnections() {
  const selectedConnection = useSelectedConnectionStore(state => state.selectedConnection);

  return useMemo(() => {
    const allConnections = orderedConnections;
    const connections: Connection[] = [];
    if (selectedConnection) {
      connections.push(selectedConnection);
      connections.push(...allConnections.filter(connection => connection !== selectedConnection));
    } else {
      connections.push(...allConnections);
    }
    return connections;
  }, [selectedConnection]);
}
