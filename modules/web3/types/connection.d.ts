import { Web3ReactHooks } from '@web3-react/core';
import { Connector, Provider } from '@web3-react/types';
import { ConnectionType } from '../connections';

export interface Connection {
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
}

export type EIP1193Provider = Provider & { chainId: number };
