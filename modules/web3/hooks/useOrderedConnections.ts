import { useMemo } from 'react';
import { Connection, getConnection, orderedConnectionTypes } from 'modules/web3/connections';
import useSelectedConnectionStore from 'modules/app/stores/selectedConnection';

export function useOrderedConnections() {
  const selectedConnection = useSelectedConnectionStore(state => state.selectedConnection);

  return useMemo(() => {
    const allConnections = orderedConnectionTypes;
    const connections: Connection[] = [];
    if (selectedConnection) {
      connections.push(getConnection(selectedConnection));
      connections.push(
        ...allConnections
          .filter(connection => connection !== selectedConnection)
          .map(connectionType => getConnection(connectionType))
      );
    } else {
      connections.push(...allConnections.map(connection => getConnection(connection)));
    }
    return connections;
  }, [selectedConnection]);
}
