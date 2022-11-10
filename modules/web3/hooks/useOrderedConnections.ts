import { useMemo } from 'react';
import { getConnection, orderedConnectionTypes } from 'modules/web3/connections';
import { Connection } from 'modules/web3/types/connection';
import useSelectedConnectionStore from 'modules/app/stores/selectedConnection';

export function useOrderedConnections(): Connection[] {
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
