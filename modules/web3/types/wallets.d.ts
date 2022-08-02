import { AbstractConnector } from '@web3-react/abstract-connector';
import { Connection } from '../connections';
import { ConnectionName } from './connections';

export interface WalletInfo {
  connection: Connection;
  name: ConnectionName;
  deeplinkUri?: string;
}
